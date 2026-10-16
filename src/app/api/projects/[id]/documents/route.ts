import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';
import { extractDeliverablesFromText } from '@/lib/ai/extractor';

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
      document_type = 'statement_of_work',
      file_name,
      file_size_bytes = 0,
      mime_type = 'text/plain',
      extracted_text,
      auto_extract_deliverables = true,
    } = body;

    if (!title || !extracted_text) {
      return NextResponse.json({ error: 'Document title and text content are required.' }, { status: 400 });
    }

    // Check existing document count for versioning
    const existing = await query<any>(
      `SELECT version FROM source_documents WHERE project_id = $1 ORDER BY version DESC LIMIT 1`,
      [projectId]
    );
    const nextVersion = existing.length > 0 ? (existing[0].version || 1) + 1 : 1;

    // Create document record
    const document = await queryOne<any>(
      `INSERT INTO source_documents (project_id, org_id, title, document_type, file_name, file_size_bytes, mime_type, extracted_text, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        projectId,
        user.orgId,
        title,
        document_type,
        file_name || `${title}.pdf`,
        file_size_bytes,
        mime_type,
        extracted_text,
        nextVersion,
      ]
    );

    let extractedItemsCount = 0;
    if (auto_extract_deliverables) {
      const items = extractDeliverablesFromText(extracted_text);
      extractedItemsCount = items.length;

      // Add deliverables
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await query(
          `INSERT INTO deliverables (project_id, org_id, source_doc_id, title, category, description, acceptance_criteria, is_explicitly_excluded, order_index, version)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            projectId,
            user.orgId,
            document.id,
            item.title,
            item.category,
            item.description,
            item.acceptanceCriteria,
            item.isExplicitlyExcluded,
            i + 1,
            nextVersion,
          ]
        );
      }
    }

    // Increment active scope version of project
    await query(`UPDATE projects SET active_scope_version = $1 WHERE id = $2`, [nextVersion, projectId]);

    await logAuditEvent({
      orgId: user.orgId,
      projectId,
      eventType: 'sow.uploaded',
      actorType: 'freelancer',
      actorId: user.id,
      actorName: user.name,
      targetType: 'source_document',
      targetId: document.id,
      metadata: { title, version: nextVersion, deliverables_extracted: extractedItemsCount },
    });

    return NextResponse.json({ document, extractedItemsCount });
  } catch (err: any) {
    console.error('Error uploading document:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
