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
    const items = await query(
      `SELECT * FROM deliverables WHERE project_id = $1 ORDER BY order_index ASC, created_at ASC`,
      [id]
    );
    return NextResponse.json({ deliverables: items });
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
      category = 'Core Feature',
      description = '',
      acceptance_criteria = '',
      is_explicitly_excluded = false,
      order_index = 0,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const item = await queryOne(
      `INSERT INTO deliverables (project_id, org_id, title, category, description, acceptance_criteria, is_explicitly_excluded, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        projectId,
        user.orgId,
        title,
        category,
        description,
        acceptance_criteria,
        Boolean(is_explicitly_excluded),
        order_index,
      ]
    );

    // Increment active scope version
    await query(`UPDATE projects SET active_scope_version = active_scope_version + 1 WHERE id = $1`, [projectId]);

    await logAuditEvent({
      orgId: user.orgId,
      projectId,
      eventType: 'deliverable.created',
      actorType: 'freelancer',
      actorId: user.id,
      actorName: user.name,
      targetType: 'deliverable',
      targetId: item.id,
      metadata: { title, is_explicitly_excluded },
    });

    return NextResponse.json({ deliverable: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();
    const { deliverableId, ...updates } = body;

    if (!deliverableId) {
      return NextResponse.json({ error: 'deliverableId is required' }, { status: 400 });
    }

    const allowed = ['title', 'category', 'description', 'acceptance_criteria', 'is_explicitly_excluded', 'order_index'];
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' });
    }

    values.push(deliverableId, projectId);
    const updated = await queryOne(
      `UPDATE deliverables SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${idx++} AND project_id = $${idx}
       RETURNING *`,
      values
    );

    // Bump scope version for traceability
    await query(`UPDATE projects SET active_scope_version = active_scope_version + 1 WHERE id = $1`, [projectId]);

    await logAuditEvent({
      orgId: user.orgId,
      projectId,
      eventType: 'deliverable.updated',
      actorType: 'freelancer',
      actorId: user.id,
      actorName: user.name,
      targetType: 'deliverable',
      targetId: deliverableId,
      metadata: updates,
    });

    return NextResponse.json({ deliverable: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const deliverableId = searchParams.get('deliverableId');

    if (!deliverableId) {
      return NextResponse.json({ error: 'deliverableId query param required' }, { status: 400 });
    }

    await query(`DELETE FROM deliverables WHERE id = $1 AND project_id = $2`, [deliverableId, projectId]);

    await logAuditEvent({
      orgId: user.orgId,
      projectId,
      eventType: 'deliverable.deleted',
      actorType: 'freelancer',
      actorId: user.id,
      actorName: user.name,
      targetType: 'deliverable',
      targetId: deliverableId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
