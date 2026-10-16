import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { classifyScopeRequest } from '@/lib/ai/classifier';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const user = await getCurrentUser();

    // 1. Fetch request details
    const clientRequest = await queryOne<any>(
      `SELECT cr.*, p.org_id, c.hourly_rate as client_hourly_rate
       FROM client_requests cr
       JOIN projects p ON cr.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       WHERE cr.id = $1 AND p.org_id = $2`,
      [requestId, user.orgId]
    );

    if (!clientRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const projectId = clientRequest.project_id;

    // 2. Fetch project deliverables & documents
    const deliverables = await query<any>(
      `SELECT * FROM deliverables WHERE project_id = $1 ORDER BY order_index ASC`,
      [projectId]
    );

    const documents = await query<any>(
      `SELECT * FROM source_documents WHERE project_id = $1 ORDER BY version DESC`,
      [projectId]
    );

    const hourlyRate = Number(clientRequest.client_hourly_rate || 150);

    // 3. Run AI Scope Classifier
    const result = await classifyScopeRequest(
      {
        title: clientRequest.title,
        raw_message: clientRequest.raw_message,
        urgency: clientRequest.urgency,
      },
      deliverables,
      documents,
      hourlyRate
    );

    // 4. Upsert classification into database
    const classification = await queryOne<any>(
      `INSERT INTO classifications (client_request_id, project_id, outcome, confidence_score, reasoning, cited_source_excerpts, suggested_hours, suggested_cost, suggested_schedule_days, classified_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (client_request_id)
       DO UPDATE SET
          outcome = EXCLUDED.outcome,
          confidence_score = EXCLUDED.confidence_score,
          reasoning = EXCLUDED.reasoning,
          cited_source_excerpts = EXCLUDED.cited_source_excerpts,
          suggested_hours = EXCLUDED.suggested_hours,
          suggested_cost = EXCLUDED.suggested_cost,
          suggested_schedule_days = EXCLUDED.suggested_schedule_days,
          classified_by = EXCLUDED.classified_by,
          created_at = NOW()
       RETURNING *`,
      [
        requestId,
        projectId,
        result.outcome,
        result.confidenceScore,
        result.reasoning,
        JSON.stringify(result.citedSourceExcerpts),
        result.suggestedHours,
        result.suggestedCost,
        result.suggestedScheduleDays,
        result.classifiedBy,
      ]
    );

    // 5. Update request status
    await query(`UPDATE client_requests SET status = 'classified', updated_at = NOW() WHERE id = $1`, [requestId]);

    // 6. Log audit event
    await logAuditEvent({
      orgId: user.orgId,
      projectId,
      eventType: 'ai.classified',
      actorType: 'system_ai',
      actorId: 'scopepilot-ai',
      actorName: result.classifiedBy,
      targetType: 'classification',
      targetId: classification.id,
      metadata: {
        outcome: result.outcome,
        confidence: result.confidenceScore,
        suggested_cost: result.suggestedCost,
        cited_excerpts_count: result.citedSourceExcerpts.length,
      },
    });

    return NextResponse.json({
      classification: {
        ...classification,
        cited_source_excerpts: result.citedSourceExcerpts,
      },
    });
  } catch (err: any) {
    console.error('Error classifying request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
