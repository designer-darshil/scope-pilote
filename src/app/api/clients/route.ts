import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const clients = await query<any>(
      `SELECT c.*,
              COUNT(p.id) as project_count,
              COALESCE(SUM(p.contract_value), 0) as total_contract_value,
              COALESCE(SUM(p.recovered_revenue), 0) as total_recovered_revenue
       FROM clients c
       LEFT JOIN projects p ON c.id = p.client_id
       WHERE c.org_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [user.orgId]
    );

    return NextResponse.json({ clients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      name,
      company_name,
      contact_email,
      contact_phone = '',
      billing_currency = 'USD',
      hourly_rate = 150,
    } = body;

    if (!name || !company_name || !contact_email) {
      return NextResponse.json({ error: 'Name, company name, and email are required.' }, { status: 400 });
    }

    const client = await queryOne<any>(
      `INSERT INTO clients (org_id, name, company_name, contact_email, contact_phone, billing_currency, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.orgId, name, company_name, contact_email, contact_phone, billing_currency, hourly_rate]
    );

    return NextResponse.json({ client });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
