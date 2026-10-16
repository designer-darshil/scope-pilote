import { query } from './db';
import { AuditEvent } from './types';

export async function logAuditEvent(params: {
  orgId: string;
  projectId?: string;
  eventType: string;
  actorType: 'freelancer' | 'client' | 'system_ai';
  actorId: string;
  actorName: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_events (org_id, project_id, event_type, actor_type, actor_id, actor_name, target_type, target_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        params.orgId,
        params.projectId || null,
        params.eventType,
        params.actorType,
        params.actorId,
        params.actorName,
        params.targetType,
        params.targetId,
        JSON.stringify(params.metadata || {}),
      ]
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

export async function getProjectAuditEvents(projectId: string): Promise<AuditEvent[]> {
  const rows = await query<any>(
    `SELECT * FROM audit_events WHERE project_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [projectId]
  );
  return rows.map((r) => ({
    ...r,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
  }));
}

export async function getOrgAuditEvents(orgId: string): Promise<AuditEvent[]> {
  const rows = await query<any>(
    `SELECT * FROM audit_events WHERE org_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [orgId]
  );
  return rows.map((r) => ({
    ...r,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
  }));
}
