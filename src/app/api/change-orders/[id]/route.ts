import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';
import { sendTransactionalEmail } from '@/lib/email/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const changeOrder = await queryOne<any>(
      `SELECT co.*, p.name as project_name, p.code as project_code,
              c.name as client_name, c.company_name, c.contact_email,
              a.id as approval_id, a.decision as approval_decision, a.approver_name, a.signature_data, a.decided_at, a.rejection_reason
       FROM change_orders co
       JOIN projects p ON co.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       LEFT JOIN approvals a ON co.id = a.change_order_id
       WHERE co.id = $1 AND co.org_id = $2`,
      [id, user.orgId]
    );

    if (!changeOrder) {
      return NextResponse.json({ error: 'Change order not found' }, { status: 404 });
    }

    return NextResponse.json({
      changeOrder: {
        ...changeOrder,
        line_items:
          typeof changeOrder.line_items === 'string'
            ? JSON.parse(changeOrder.line_items)
            : changeOrder.line_items || [],
        approval: changeOrder.approval_id
          ? {
              id: changeOrder.approval_id,
              decision: changeOrder.approval_decision,
              approver_name: changeOrder.approver_name,
              signature_data: changeOrder.signature_data,
              decided_at: changeOrder.decided_at,
              rejection_reason: changeOrder.rejection_reason,
            }
          : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      title,
      description,
      line_items,
      total_amount,
      schedule_delay_days,
      status, // 'draft' | 'sent_to_client' | 'approved' | 'rejected' | 'canceled'
    } = body;

    const current = await queryOne<any>(
      `SELECT co.*, p.name as project_name, c.name as client_name, c.contact_email
       FROM change_orders co
       JOIN projects p ON co.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       WHERE co.id = $1 AND co.org_id = $2`,
      [id, user.orgId]
    );

    if (!current) {
      return NextResponse.json({ error: 'Change order not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (title !== undefined) {
      updates.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }
    if (line_items !== undefined) {
      updates.push(`line_items = $${idx++}`);
      values.push(JSON.stringify(line_items));
    }
    if (total_amount !== undefined) {
      updates.push(`total_amount = $${idx++}`);
      values.push(Number(total_amount));
    }
    if (schedule_delay_days !== undefined) {
      updates.push(`schedule_delay_days = $${idx++}`);
      values.push(Number(schedule_delay_days));
    }
    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);

      if (status === 'sent_to_client' && current.status !== 'sent_to_client') {
        updates.push(`sent_at = NOW()`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No updates provided' });
    }

    values.push(id, user.orgId);
    const updated = await queryOne<any>(
      `UPDATE change_orders SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${idx++} AND org_id = $${idx}
       RETURNING *`,
      values
    );

    // If sent to client, fire transactional email notification
    if (status === 'sent_to_client' && current.status !== 'sent_to_client') {
      const approvalUrl = `/portal/meridian_portal/change-orders/${updated.id}?token=${updated.client_access_token}`;

      await sendTransactionalEmail({
        to: current.contact_email,
        subject: `[Action Required] Change Order ${updated.order_number}: ${updated.title}`,
        bodyText: `Hello ${current.client_name},\n\nPlease review and approve Change Order ${updated.order_number} for ${current.project_name}. Total: $${updated.total_amount}. Review portal: ${approvalUrl}`,
        bodyHtml: `<p>Hello ${current.client_name},</p><p>Please review and approve Change Order <strong>${updated.order_number}</strong> for <em>${current.project_name}</em>.</p><p>Amount: <strong>$${updated.total_amount}</strong> | Schedule Impact: <strong>+${updated.schedule_delay_days} days</strong></p><p><a href="${approvalUrl}">Click here to Review and Approve</a></p>`,
        category: 'change_order_sent',
        metadata: { change_order_id: updated.id, token: updated.client_access_token },
      });

      await logAuditEvent({
        orgId: user.orgId,
        projectId: updated.project_id,
        eventType: 'change_order.sent',
        actorType: 'freelancer',
        actorId: user.id,
        actorName: user.name,
        targetType: 'change_order',
        targetId: updated.id,
        metadata: {
          order_number: updated.order_number,
          amount: updated.total_amount,
          client_email: current.contact_email,
        },
      });
    }

    return NextResponse.json({
      changeOrder: {
        ...updated,
        line_items:
          typeof updated.line_items === 'string' ? JSON.parse(updated.line_items) : updated.line_items || [],
      },
    });
  } catch (err: any) {
    console.error('Error updating change order:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
