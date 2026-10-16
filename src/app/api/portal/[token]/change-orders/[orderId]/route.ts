import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { sendTransactionalEmail } from '@/lib/email/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; orderId: string }> }
) {
  try {
    const { token, orderId } = await params;

    const changeOrder = await queryOne<any>(
      `SELECT co.*, p.name as project_name, p.code as project_code, p.portal_token,
              c.name as client_name, c.company_name, c.contact_email,
              o.name as agency_name,
              a.id as approval_id, a.decision as approval_decision, a.approver_name, a.signature_data, a.decided_at, a.rejection_reason
       FROM change_orders co
       JOIN projects p ON co.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       JOIN organizations o ON p.org_id = o.id
       LEFT JOIN approvals a ON co.id = a.change_order_id
       WHERE co.id = $1 AND p.portal_token = $2`,
      [orderId, token]
    );

    if (!changeOrder) {
      return NextResponse.json({ error: 'Change order not found or invalid link.' }, { status: 404 });
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
    console.error('Error fetching client change order:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; orderId: string }> }
) {
  try {
    const { token, orderId } = await params;
    const body = await req.json();

    const {
      decision, // 'approved' | 'rejected'
      approverName,
      approverEmail,
      approverTitle,
      signatureData,
      rejectionReason,
    } = body;

    if (!decision || !approverName) {
      return NextResponse.json({ error: 'Decision and approver name are required.' }, { status: 400 });
    }

    const changeOrder = await queryOne<any>(
      `SELECT co.*, p.name as project_name, p.org_id, c.name as client_name, c.contact_email as client_email,
              o.name as agency_name, m.user_email as agency_email
       FROM change_orders co
       JOIN projects p ON co.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       JOIN organizations o ON p.org_id = o.id
       LEFT JOIN memberships m ON m.org_id = o.id AND m.role = 'owner'
       WHERE co.id = $1 AND p.portal_token = $2`,
      [orderId, token]
    );

    if (!changeOrder) {
      return NextResponse.json({ error: 'Change order not found.' }, { status: 404 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser Client';

    // 1. Record approval/rejection
    const approval = await queryOne<any>(
      `INSERT INTO approvals (change_order_id, decision, approver_name, approver_email, approver_title, signature_data, ip_address, user_agent, rejection_reason, decided_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [
        orderId,
        decision,
        approverName,
        approverEmail || changeOrder.client_email,
        approverTitle || 'Authorized Representative',
        signatureData || `${approverName} (Digital Confirmation)`,
        ipAddress,
        userAgent,
        rejectionReason || null,
      ]
    );

    // 2. Update Change Order status
    const newStatus = decision === 'approved' ? 'approved' : 'rejected';
    await query(`UPDATE change_orders SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, orderId]);

    // 3. If approved, update project recovered revenue and timeline
    if (decision === 'approved') {
      await query(
        `UPDATE projects
         SET recovered_revenue = recovered_revenue + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [Number(changeOrder.total_amount), changeOrder.project_id]
      );
    }

    // 4. Send transactional notification email to agency
    const agencyNotificationEmail = changeOrder.agency_email || 'alex@apexdigital.dev';
    await sendTransactionalEmail({
      to: agencyNotificationEmail,
      subject: `[Change Order ${newStatus.toUpperCase()}] ${changeOrder.order_number} by ${approverName}`,
      bodyText: `Change Order ${changeOrder.order_number} ($${changeOrder.total_amount}) has been ${newStatus} by ${approverName} (${approverTitle}).\nProject: ${changeOrder.project_name}`,
      bodyHtml: `<p>Change Order <strong>${changeOrder.order_number}</strong> for <em>${changeOrder.project_name}</em> has been <strong style="color:${decision === 'approved' ? '#059669' : '#DC2626'}">${newStatus.toUpperCase()}</strong> by ${approverName}.</p><p>Amount: <strong>$${changeOrder.total_amount}</strong></p>`,
      category: decision === 'approved' ? 'change_order_approved' : 'change_order_rejected',
      metadata: { change_order_id: orderId, decision },
    });

    // 5. Log immutable audit event
    await logAuditEvent({
      orgId: changeOrder.org_id,
      projectId: changeOrder.project_id,
      eventType: decision === 'approved' ? 'change_order.approved' : 'change_order.rejected',
      actorType: 'client',
      actorId: approverEmail || approverName,
      actorName: approverName,
      targetType: 'change_order',
      targetId: orderId,
      metadata: {
        order_number: changeOrder.order_number,
        amount: changeOrder.total_amount,
        decision,
        approver_title: approverTitle,
        ip_address: ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      decision,
      approval,
    });
  } catch (err: any) {
    console.error('Error recording client approval decision:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
