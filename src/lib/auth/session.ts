import { queryOne } from '../db';
import { Organization } from '../types';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  orgId: string;
  orgName: string;
}

export const DEFAULT_USER: CurrentUser = {
  id: 'usr_alex_vance',
  name: 'Alex Vance',
  email: 'alex@apexdigital.dev',
  role: 'owner',
  orgId: 'org_apex_studio',
  orgName: 'Apex Digital Studio',
};

export async function getCurrentUser(): Promise<CurrentUser> {
  // In production, extracts from Supabase Auth cookie or header.
  // Defaults to the active tenant 'Apex Digital Studio' for instantaneous zero-friction demo.
  try {
    const org = await queryOne<Organization>(`SELECT * FROM organizations WHERE id = $1`, [
      DEFAULT_USER.orgId,
    ]);
    if (org) {
      return {
        ...DEFAULT_USER,
        orgName: org.name,
      };
    }
  } catch (err) {
    console.warn('Could not query current user from DB:', err);
  }
  return DEFAULT_USER;
}
