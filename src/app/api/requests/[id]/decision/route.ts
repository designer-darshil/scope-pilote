import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';
import { sendTransactionalEmail } from '@/lib/email/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      decision, // 'accepted_in_scope' | 'create_change_order' | 'rejected'
      reviewerNotes = '',
      // Change order fields (if creating change order)
      orderTitle,
      orderDescription,
      lineItems = [],
      totalAmount = 0,
      scheduleDelayDays = 0,
      currency = 'USD',
    } = body;

    const request = await queryOne<any>(
      `SELECT cr.*, p.name as project_name, p.org_id, c.name as client_name, c.contact_email
       FROM client_requests cr
       JOIN projects p ON cr.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       WHERE cr.id = $1 AND p.org_id = $2`,
      [requestId, user.orgId]
    );

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const projectId = request.project_id;

    if (decision === 'accepted_in_scope') {
      await query(
        `UPDATE client_requests SET status = 'accepted_in_scope', updated_at = NOW() WHERE id = $1`,
        [requestId]
      );

      // Update classification with manual override or notes if present
      await query(
        `UPDATE classifications SET reviewer_notes = $1, is_manual_override = true WHERE client_request_id = $2`,
        [reviewerNotes, requestId]
      );

      await logAuditEvent({
        orgId: user.orgId,
        projectId,
        eventType: 'request.accepted_in_scope',
        actorType: 'freelancer',
        actorId: user.id,
        actorName: user.name,
        targetType: 'client_request',
        targetId: requestId,
        metadata: { notes: reviewerNotes },
      });

      return NextResponse.json({ success: true, status: 'accepted_in_scope' });
    }

    if (decision === 'rejected') {
      await query(
        `UPDATE client_requests SET status = 'rejected', updated_at = NOW() WHERE id = $1`,
        [requestId]
      );

      await logAuditEvent({
        orgId: user.orgId,
        projectId,
        eventType: 'request.rejected',
        actorType: 'freelancer',
        actorId: user.id,
        actorName: user.name,
        targetType: 'client_request',
        targetId: requestId,
        metadata: { notes: reviewerNotes },
      });

      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (decision === 'create_change_order') {
      // Generate Order Number
      const countRow = await queryOne<any>(
        `SELECT COUNT(*) as co_count FROM change_orders WHERE project_id = $1`,
        [projectId]
      );
      const coNum = (Number(countRow?.co_count || 0) + 1).toString().padStart(3, '0');
      const orderNumber = `CO-2026-${coNum}`;

      // Default line items if empty
      const finalLineItems =
        lineItems.length > 0
          ? lineItems
          : [
              {
                id: 'item-1',
                description: orderTitle || `Scope Extension for Request #${request.request_number}`,
                hours: Math.max(1, Math.round(Number(totalAmount) / 150)),
                rate: 150,
                amount: Number(totalAmount) || 1500,
              },
            ];

      const calculatedTotal = finalLineItems.reduce(
        (sum: number, item: any) => sum + (Number(item.amount) || Number(item.hours) * Number(item.rate) || 0),
        0
      );

      const changeOrder = await queryOne<any>(
        `INSERT INTO change_orders (project_id, org_id, client_request_id, order_number, title, description, line_items, total_amount, currency, schedule_delay_days, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft')
         RETURNING *`,
        [
          projectId,
          user.orgId,
          requestId,
          orderNumber,
          orderTitle || `Change Order: ${request.title}`,
          orderDescription || request.raw_message,
          JSON.stringify(finalLineItems),
          calculatedTotal,
          currency,
          Number(scheduleDelayDays) || 0,
        ]
      );

      // Update client request status
      await query(
        `UPDATE client_requests SET status = 'change_order_created', updated_at = NOW() WHERE id = $1`,
        [requestId]
      );

      await logAuditEvent({
        orgId: user.orgId,
        projectId,
        eventType: 'change_order.drafted',
        actorType: 'freelancer',
        actorId: user.id,
        actorName: user.name,
        targetType: 'change_order',
        targetId: changeOrder.id,
        metadata: {
          order_number: orderNumber,
          total_amount: calculatedTotal,
          delay_days: scheduleDelayDays,
        },
      });

      return NextResponse.json({
        success: true,
        status: 'change_order_created',
        changeOrder: {
          ...changeOrder,
          line_items: finalLineItems,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid decision type' }, { status: 400 });
  } catch (err: any) {
    console.error('Error handling request decision:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
