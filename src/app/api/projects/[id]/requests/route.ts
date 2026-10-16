import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requests = await query(
      `SELECT cr.*,
              c.id as cls_id, c.outcome, c.confidence_score, c.reasoning, c.cited_source_excerpts,
              c.suggested_hours, c.suggested_cost, c.suggested_schedule_days, c.is_manual_override
       FROM client_requests cr
       LEFT JOIN classifications c ON cr.id = c.client_request_id
       WHERE cr.project_id = $1
       ORDER BY cr.created_at DESC`,
      [id]
    );

    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      title,
      raw_message,
      submitted_by_name = 'Client Partner',
      submitted_by_email = 'client@example.com',
      urgency = 'medium',
      attachments = [],
    } = body;

    if (!title || !raw_message) {
      return NextResponse.json({ error: 'Title and request message are required.' }, { status: 400 });
    }

    // Get max request_number
    const numRow = await queryOne<any>(
      `SELECT COALESCE(MAX(request_number), 100) + 1 as next_num FROM client_requests WHERE project_id = $1`,
      [projectId]
    );
    const nextNumber = numRow?.next_num || 101;

    const request = await queryOne<any>(
      `INSERT INTO client_requests (project_id, org_id, request_number, title, raw_message, submitted_by_name, submitted_by_email, urgency, attachments_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        projectId,
        user.orgId,
        nextNumber,
        title,
        raw_message,
        submitted_by_name,
        submitted_by_email,
        urgency,
        JSON.stringify(attachments),
      ]
    );

    await logAuditEvent({
      orgId: user.orgId,
      projectId,
      eventType: 'request.received',
      actorType: 'freelancer',
      actorId: user.id,
      actorName: user.name,
      targetType: 'client_request',
      targetId: request.id,
      metadata: { request_number: nextNumber, title },
    });

    return NextResponse.json({ request });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
