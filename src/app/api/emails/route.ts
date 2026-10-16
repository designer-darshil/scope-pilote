import { NextRequest, NextResponse } from 'next/server';
import { getSentEmails } from '@/lib/email/service';

export async function GET(req: NextRequest) {
  return NextResponse.json({ emails: getSentEmails() });
}
