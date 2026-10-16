import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { sendTransactionalEmail } from '@/lib/email/service';
import { classifyScopeRequest } from '@/lib/ai/classifier';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const project = await queryOne<any>(
      `SELECT p.id, p.org_id, p.name, p.code, p.status, p.portal_token, p.portal_enabled,
              c.name as client_name, c.company_name, c.contact_email, c.hourly_rate,
              o.name as agency_name
       FROM projects p
       JOIN clients c ON p.client_id = c.id
       JOIN organizations o ON p.org_id = o.id
       WHERE p.portal_token = $1`,
      [token]
    );

    if (!project || !project.portal_enabled) {
      return NextResponse.json({ error: 'Client portal not found or inactive.' }, { status: 404 });
    }

    const requests = await query<any>(
      `SELECT id, request_number, title, raw_message, submitted_by_name, urgency, status, created_at
       FROM client_requests
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [project.id]
    );

    const changeOrders = await query<any>(
      `SELECT id, order_number, title, total_amount, currency, schedule_delay_days, status, client_access_token, created_at
       FROM change_orders
       WHERE project_id = $1 AND status != 'draft'
       ORDER BY created_at DESC`,
      [project.id]
    );

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        clientName: project.client_name,
        companyName: project.company_name,
        agencyName: project.agency_name,
      },
      requests,
      changeOrders,
    });
  } catch (err: any) {
    console.error('Error fetching portal data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    const {
      title,
      message,
      submitterName,
      submitterEmail,
      urgency = 'medium',
      attachments = [],
    } = body;

    if (!title || !message || !submitterName) {
      return NextResponse.json({ error: 'Title, message, and your name are required.' }, { status: 400 });
    }

    const project = await queryOne<any>(
      `SELECT p.id, p.org_id, p.name, c.hourly_rate, o.settings, m.user_email as agency_email, m.user_name as agency_user
       FROM projects p
       JOIN clients c ON p.client_id = c.id
       JOIN organizations o ON p.org_id = o.id
       LEFT JOIN memberships m ON m.org_id = o.id AND m.role = 'owner'
       WHERE p.portal_token = $1`,
      [token]
    );

    if (!project) {
      return NextResponse.json({ error: 'Portal access expired or invalid.' }, { status: 404 });
    }

    const projectId = project.id;

    // Get next request number
    const numRow = await queryOne<any>(
      `SELECT COALESCE(MAX(request_number), 100) + 1 as next_num FROM client_requests WHERE project_id = $1`,
      [projectId]
    );
    const requestNumber = numRow?.next_num || 101;

    // Create client request
    const request = await queryOne<any>(
      `INSERT INTO client_requests (project_id, org_id, request_number, title, raw_message, submitted_by_name, submitted_by_email, urgency, attachments_json, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_classification')
       RETURNING *`,
      [
        projectId,
        project.org_id,
        requestNumber,
        title,
        message,
        submitterName,
        submitterEmail || 'client@example.com',
        urgency,
        JSON.stringify(attachments),
      ]
    );

    // Auto-classify using AI
    const deliverables = await query<any>(
      `SELECT * FROM deliverables WHERE project_id = $1 ORDER BY order_index ASC`,
      [projectId]
    );
    const documents = await query<any>(
      `SELECT * FROM source_documents WHERE project_id = $1 ORDER BY version DESC`,
      [projectId]
    );

    const classification = await classifyScopeRequest(
      { title, raw_message: message, urgency },
      deliverables,
      documents,
      Number(project.hourly_rate || 150)
    );

    // Save classification
    await query(
      `INSERT INTO classifications (client_request_id, project_id, outcome, confidence_score, reasoning, cited_source_excerpts, suggested_hours, suggested_cost, suggested_schedule_days, classified_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        request.id,
        projectId,
        classification.outcome,
        classification.confidenceScore,
        classification.reasoning,
        JSON.stringify(classification.citedSourceExcerpts),
        classification.suggestedHours,
        classification.suggestedCost,
        classification.suggestedScheduleDays,
        classification.classifiedBy,
      ]
    );

    // Update request status to classified
    await query(`UPDATE client_requests SET status = 'classified' WHERE id = $1`, [request.id]);

    // Send email alert to freelancer
    const notificationEmail = project.agency_email || 'alex@apexdigital.dev';
    await sendTransactionalEmail({
      to: notificationEmail,
      subject: `[New Request #${requestNumber}] ${title} from ${submitterName}`,
      bodyText: `New request #${requestNumber} submitted for ${project.name}.\n\nTitle: ${title}\nSubmitted by: ${submitterName}\nAI Classification: ${classification.outcome.toUpperCase()} (Confidence: ${(classification.confidenceScore * 100).toFixed(0)}%)\n\nLog in to review and decide.`,
      bodyHtml: `<p>New request <strong>#${requestNumber}</strong> submitted for <em>${project.name}</em>.</p><p><strong>Title:</strong> ${title}<br><strong>Submitter:</strong> ${submitterName} (${submitterEmail})</p><p><strong>AI Classification:</strong> <span style="font-weight:bold; color: #4F46E5;">${classification.outcome.toUpperCase()}</span> (${(classification.confidenceScore * 100).toFixed(0)}% confidence)</p><p>Review this request in your ScopePilot dashboard.</p>`,
      category: 'request_received',
      metadata: { request_id: request.id, project_id: projectId },
    });

    // Log immutable audit event
    await logAuditEvent({
      orgId: project.org_id,
      projectId,
      eventType: 'request.received',
      actorType: 'client',
      actorId: submitterEmail || submitterName,
      actorName: submitterName,
      targetType: 'client_request',
      targetId: request.id,
      metadata: {
        request_number: requestNumber,
        title,
        urgency,
        ai_outcome: classification.outcome,
      },
    });

    return NextResponse.json({
      success: true,
      request: {
        ...request,
        status: 'classified',
        classification,
      },
    });
  } catch (err: any) {
    console.error('Error in client portal submission:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
