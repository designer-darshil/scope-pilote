export type PlanTier = 'starter' | 'growth' | 'agency';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_tier: PlanTier;
  settings: {
    auto_classify: boolean;
    require_approval_signature: boolean;
    notification_email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  billing_currency: string;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  client_id: string;
  client_name?: string;
  company_name?: string;
  name: string;
  code: string;
  status: 'active' | 'in_review' | 'completed' | 'archived';
  contract_value: number;
  start_date: string;
  target_completion_date: string;
  portal_token: string;
  portal_enabled: boolean;
  active_scope_version: number;
  scope_drift_score: number;
  recovered_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface SourceDocument {
  id: string;
  project_id: string;
  org_id: string;
  title: string;
  document_type: 'statement_of_work' | 'proposal' | 'agreement' | 'addendum' | 'client_brief';
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  file_url?: string;
  extracted_text: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  org_id: string;
  source_doc_id?: string;
  title: string;
  category: string;
  description: string;
  acceptance_criteria?: string;
  is_explicitly_excluded: boolean;
  version: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CitedExcerpt {
  document_id: string;
  document_title: string;
  section: string;
  excerpt: string;
  relevance: string;
  matched_deliverable_id?: string;
}

export type ClassificationOutcome = 'in_scope' | 'out_of_scope' | 'needs_review';

export interface Classification {
  id: string;
  client_request_id: string;
  project_id: string;
  outcome: ClassificationOutcome;
  confidence_score: number; // 0.0 - 1.0
  reasoning: string;
  cited_source_excerpts: CitedExcerpt[];
  suggested_hours: number;
  suggested_cost: number;
  suggested_schedule_days: number;
  is_manual_override: boolean;
  reviewer_notes?: string;
  classified_by: string;
  created_at: string;
}

export type ClientRequestStatus =
  | 'pending_classification'
  | 'classified'
  | 'accepted_in_scope'
  | 'change_order_created'
  | 'rejected';

export interface ClientRequest {
  id: string;
  project_id: string;
  org_id: string;
  request_number: number;
  title: string;
  raw_message: string;
  submitted_by_name: string;
  submitted_by_email: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  attachments_json: Array<{ name: string; url: string; size?: number }>;
  status: ClientRequestStatus;
  classification?: Classification;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export type ChangeOrderStatus =
  | 'draft'
  | 'sent_to_client'
  | 'approved'
  | 'rejected'
  | 'canceled';

export interface ChangeOrder {
  id: string;
  project_id: string;
  org_id: string;
  client_request_id?: string;
  order_number: string;
  title: string;
  description: string;
  line_items: LineItem[];
  total_amount: number;
  currency: string;
  schedule_delay_days: number;
  revised_delivery_date?: string;
  status: ChangeOrderStatus;
  client_access_token: string;
  token_expires_at?: string;
  sent_at?: string;
  approval?: Approval;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  change_order_id: string;
  decision: 'approved' | 'rejected';
  approver_name: string;
  approver_email: string;
  approver_title?: string;
  signature_data?: string;
  ip_address?: string;
  user_agent?: string;
  rejection_reason?: string;
  client_feedback?: string;
  decided_at: string;
}

export interface AuditEvent {
  id: string;
  org_id: string;
  project_id?: string;
  event_type: string;
  actor_type: 'freelancer' | 'client' | 'system_ai';
  actor_id: string;
  actor_name: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ScopeDriftStats {
  driftScore: number;
  totalRequests: number;
  outOfScopeRequests: number;
  inScopeRequests: number;
  needsReviewRequests: number;
  approvedChangeOrders: number;
  pendingChangeOrders: number;
  recoveredRevenue: number;
  originalContractValue: number;
  totalScheduleDelayDays: number;
}
