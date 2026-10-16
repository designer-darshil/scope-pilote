import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';
import { extractDeliverablesFromText } from '@/lib/ai/extractor';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const projects = await query<any>(
      `SELECT p.*, c.name as client_name, c.company_name, c.hourly_rate as client_hourly_rate,
              (SELECT COUNT(*) FROM client_requests cr WHERE cr.project_id = p.id) as request_count,
              (SELECT COUNT(*) FROM change_orders co WHERE co.project_id = p.id AND co.status = 'approved') as approved_co_count
       FROM projects p
       JOIN clients c ON p.client_id = c.id
       WHERE p.org_id = $1
       ORDER BY p.created_at DESC`,
      [user.orgId]
    );

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      name,
      code,
      clientName,
      companyName,
      contactEmail,
      contractValue = 0,
      hourlyRate = 150,
      sowTitle = 'Statement of Work v1.0',
      sowText = '',
    } = body;

    if (!name || !clientName || !contactEmail) {
      return NextResponse.json({ error: 'Project name, client name, and email are required.' }, { status: 400 });
    }

    // 1. Create or get client
    let client = await queryOne<any>(
      `SELECT * FROM clients WHERE org_id = $1 AND contact_email = $2`,
      [user.orgId, contactEmail]
    );

    if (!client) {
      client = await queryOne<any>(
        `INSERT INTO clients (org_id, name, company_name, contact_email, hourly_rate)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user.orgId, clientName, companyName || clientName, contactEmail, hourlyRate]
      );
    }

    // 2. Create project
    const projectCode = code || `PRJ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const project = await queryOne<any>(
      `INSERT INTO projects (org_id, client_id, name, code, contract_value, portal_enabled)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [user.orgId, client.id, name, projectCode, contractValue]
    );

    // 3. Create initial SOW document if text provided
    let docId = null;
    if (sowText && sowText.trim()) {
      const doc = await queryOne<any>(
        `INSERT INTO source_documents (project_id, org_id, title, document_type, file_name, extracted_text)
         VALUES ($1, $2, $3, 'statement_of_work', $4, $5)
         RETURNING *`,
        [project.id, user.orgId, sowTitle, `${sowTitle}.txt`, sowText]
      );
      docId = doc.id;

      // 4. Auto-extract deliverables
      const extracted = extractDeliverablesFromText(sowText);
      for (let i = 0; i < extracted.length; i++) {
        const item = extracted[i];
        await query(
          `INSERT INTO deliverables (project_id, org_id, source_doc_id, title, category, description, acceptance_criteria, is_explicitly_excluded, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            project.id,
            user.orgId,
            docId,
            item.title,
            item.category,
            item.description,
            item.acceptanceCriteria,
            item.isExplicitlyExcluded,
            i + 1,
          ]
        );
      }
    }

    await logAuditEvent({
      orgId: user.orgId,
      projectId: project.id,
      eventType: 'project.created',
      actorType: 'freelancer',
      actorId: user.id,
      actorName: user.name,
      targetType: 'project',
      targetId: project.id,
      metadata: { name: project.name, contract_value: contractValue },
    });

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
