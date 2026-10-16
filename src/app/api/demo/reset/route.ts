import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const sql = fs.readFileSync(seedPath, 'utf8');
      await query(sql);
    }
    return NextResponse.json({ success: true, message: 'Demo data successfully reset to baseline.' });
  } catch (err: any) {
    console.error('Error resetting demo:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
