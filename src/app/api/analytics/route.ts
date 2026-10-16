import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { getOrgAuditEvents } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Recovered revenue
    const revRow = await query<any>(
      `SELECT COALESCE(SUM(total_amount), 0) as total_recovered
       FROM change_orders
       WHERE org_id = $1 AND status = 'approved'`,
      [user.orgId]
    );

    // Active projects count
    const projRow = await query<any>(
      `SELECT COUNT(*) as project_count, COALESCE(SUM(contract_value), 0) as total_contract_value
       FROM projects WHERE org_id = $1`,
      [user.orgId]
    );

    // Requests breakdown
    const reqStats = await query<any>(
      `SELECT
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending_classification' THEN 1 END) as pending_classification,
          COUNT(CASE WHEN status = 'classified' THEN 1 END) as awaiting_decision,
          COUNT(CASE WHEN status = 'change_order_created' THEN 1 END) as change_orders_count,
          COUNT(CASE WHEN status = 'accepted_in_scope' THEN 1 END) as accepted_count,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
       FROM client_requests WHERE org_id = $1`,
      [user.orgId]
    );

    // Audit events
    const auditLogs = await getOrgAuditEvents(user.orgId);

    const totalRequests = Number(reqStats[0]?.total_requests || 0);
    const outOfScopeRequests = Number(reqStats[0]?.change_orders_count || 0);
    const driftIndex = totalRequests > 0 ? (outOfScopeRequests / totalRequests) * 100 : 0;

    return NextResponse.json({
      recoveredRevenue: Number(revRow[0]?.total_recovered || 0),
      totalProjects: Number(projRow[0]?.project_count || 0),
      totalContractValue: Number(projRow[0]?.total_contract_value || 0),
      driftIndex: Number(driftIndex.toFixed(1)),
      requestStats: reqStats[0],
      recentAuditLogs: auditLogs.slice(0, 15),
    });
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
