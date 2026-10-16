import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // 1. Fetch project with client info
    const project = await queryOne<any>(
      `SELECT p.*, c.name as client_name, c.company_name, c.contact_email, c.contact_phone, c.hourly_rate as client_hourly_rate, c.billing_currency
       FROM projects p
       JOIN clients c ON p.client_id = c.id
       WHERE p.id = $1 AND p.org_id = $2`,
      [id, user.orgId]
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 2. Fetch documents
    const documents = await query<any>(
      `SELECT * FROM source_documents WHERE project_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    // 3. Fetch deliverables
    const deliverables = await query<any>(
      `SELECT * FROM deliverables WHERE project_id = $1 ORDER BY order_index ASC, created_at ASC`,
      [id]
    );

    // 4. Fetch client requests with classifications
    const requests = await query<any>(
      `SELECT cr.*,
              c.id as cls_id, c.outcome, c.confidence_score, c.reasoning, c.cited_source_excerpts,
              c.suggested_hours, c.suggested_cost, c.suggested_schedule_days, c.is_manual_override,
              c.classified_by
       FROM client_requests cr
       LEFT JOIN classifications c ON cr.id = c.client_request_id
       WHERE cr.project_id = $1
       ORDER BY cr.created_at DESC`,
      [id]
    );

    // Format requests with classification object
    const formattedRequests = requests.map((r) => {
      let classification = null;
      if (r.cls_id) {
        classification = {
          id: r.cls_id,
          outcome: r.outcome,
          confidence_score: Number(r.confidence_score),
          reasoning: r.reasoning,
          cited_source_excerpts:
            typeof r.cited_source_excerpts === 'string'
              ? JSON.parse(r.cited_source_excerpts)
              : r.cited_source_excerpts || [],
          suggested_hours: Number(r.suggested_hours || 0),
          suggested_cost: Number(r.suggested_cost || 0),
          suggested_schedule_days: Number(r.suggested_schedule_days || 0),
          is_manual_override: r.is_manual_override,
          classified_by: r.classified_by,
        };
      }
      return {
        ...r,
        classification,
      };
    });

    // 5. Fetch change orders with approvals
    const changeOrders = await query<any>(
      `SELECT co.*, a.id as approval_id, a.decision as approval_decision, a.approver_name, a.signature_data, a.decided_at
       FROM change_orders co
       LEFT JOIN approvals a ON co.id = a.change_order_id
       WHERE co.project_id = $1
       ORDER BY co.created_at DESC`,
      [id]
    );

    const formattedChangeOrders = changeOrders.map((co) => ({
      ...co,
      line_items: typeof co.line_items === 'string' ? JSON.parse(co.line_items) : co.line_items || [],
      approval: co.approval_id
        ? {
            id: co.approval_id,
            decision: co.approval_decision,
            approver_name: co.approver_name,
            signature_data: co.signature_data,
            decided_at: co.decided_at,
          }
        : null,
    }));

    // 6. Calculate scope drift metrics
    const totalRequests = formattedRequests.length;
    const outOfScopeCount = formattedRequests.filter(
      (r) => r.classification?.outcome === 'out_of_scope'
    ).length;
    const driftScore = totalRequests > 0 ? (outOfScopeCount / totalRequests) * 100 : 0;

    const recoveredRevenue = formattedChangeOrders
      .filter((co) => co.status === 'approved')
      .reduce((sum, co) => sum + Number(co.total_amount || 0), 0);

    const totalScheduleDelayDays = formattedChangeOrders
      .filter((co) => co.status === 'approved')
      .reduce((sum, co) => sum + Number(co.schedule_delay_days || 0), 0);

    return NextResponse.json({
      project: {
        ...project,
        scope_drift_score: Number(driftScore.toFixed(1)),
        recovered_revenue: recoveredRevenue,
      },
      documents,
      deliverables,
      requests: formattedRequests,
      changeOrders: formattedChangeOrders,
      stats: {
        driftScore: Number(driftScore.toFixed(1)),
        totalRequests,
        outOfScopeRequests: outOfScopeCount,
        inScopeRequests: formattedRequests.filter((r) => r.classification?.outcome === 'in_scope').length,
        needsReviewRequests: formattedRequests.filter(
          (r) => !r.classification || r.classification.outcome === 'needs_review'
        ).length,
        approvedChangeOrders: formattedChangeOrders.filter((co) => co.status === 'approved').length,
        pendingChangeOrders: formattedChangeOrders.filter((co) => co.status === 'sent_to_client' || co.status === 'draft').length,
        recoveredRevenue,
        originalContractValue: Number(project.contract_value || 0),
        totalScheduleDelayDays,
      },
    });
  } catch (err: any) {
    console.error('Error fetching project details:', err);
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

    const allowed = ['name', 'status', 'contract_value', 'portal_enabled'];
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No updates provided' });
    }

    values.push(id, user.orgId);
    const updated = await queryOne(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${idx++} AND org_id = $${idx}
       RETURNING *`,
      values
    );

    return NextResponse.json({ project: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
