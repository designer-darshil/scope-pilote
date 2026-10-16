-- ScopePilot Multi-tenant PostgreSQL Schema & Migrations
-- Compatible with Supabase PostgreSQL and Row-Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY DEFAULT ('org_' || substr(md5(random()::text), 1, 16)),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_tier TEXT NOT NULL DEFAULT 'growth' CHECK (plan_tier IN ('starter', 'growth', 'agency')),
    settings JSONB DEFAULT '{"auto_classify": true, "require_approval_signature": true, "notification_email": "team@agency.com"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Memberships
CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY DEFAULT ('mem_' || substr(md5(random()::text), 1, 16)),
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY DEFAULT ('sub_' || substr(md5(random()::text), 1, 16)),
    org_id TEXT NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
    plan_id TEXT NOT NULL DEFAULT 'growth' CHECK (plan_id IN ('starter', 'growth', 'agency')),
    monthly_request_limit INT NOT NULL DEFAULT 50,
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Usage Records
CREATE TABLE IF NOT EXISTS usage_records (
    id TEXT PRIMARY KEY DEFAULT ('usg_' || substr(md5(random()::text), 1, 16)),
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_month TEXT NOT NULL,
    ai_classifications_count INT NOT NULL DEFAULT 0,
    change_orders_generated INT NOT NULL DEFAULT 0,
    storage_used_bytes BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (org_id, period_month)
);

-- 5. Clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT ('cli_' || substr(md5(random()::text), 1, 16)),
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    billing_currency TEXT NOT NULL DEFAULT 'USD',
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Projects
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT ('prj_' || substr(md5(random()::text), 1, 16)),
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_review', 'completed', 'archived')),
    contract_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE DEFAULT CURRENT_DATE,
    target_completion_date DATE DEFAULT (CURRENT_DATE + 60),
    portal_token TEXT UNIQUE NOT NULL DEFAULT ('port_' || substr(md5(random()::text), 1, 24)),
    portal_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    active_scope_version INT NOT NULL DEFAULT 1,
    scope_drift_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    recovered_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Source Documents
CREATE TABLE IF NOT EXISTS source_documents (
    id TEXT PRIMARY KEY DEFAULT ('doc_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'statement_of_work' CHECK (document_type IN ('statement_of_work', 'proposal', 'agreement', 'addendum', 'client_brief')),
    file_name TEXT NOT NULL,
    file_size_bytes INT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    file_url TEXT,
    extracted_text TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Deliverables (Structured Scope Checklist)
CREATE TABLE IF NOT EXISTS deliverables (
    id TEXT PRIMARY KEY DEFAULT ('del_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_doc_id TEXT REFERENCES source_documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Core Feature',
    description TEXT NOT NULL,
    acceptance_criteria TEXT,
    is_explicitly_excluded BOOLEAN NOT NULL DEFAULT FALSE,
    version INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Client Requests (Intake)
CREATE TABLE IF NOT EXISTS client_requests (
    id TEXT PRIMARY KEY DEFAULT ('req_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    request_number INT NOT NULL,
    title TEXT NOT NULL,
    raw_message TEXT NOT NULL,
    submitted_by_name TEXT NOT NULL,
    submitted_by_email TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    attachments_json JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending_classification' CHECK (status IN ('pending_classification', 'classified', 'accepted_in_scope', 'change_order_created', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, request_number)
);

-- 10. Classifications (AI-assisted with Citations)
CREATE TABLE IF NOT EXISTS classifications (
    id TEXT PRIMARY KEY DEFAULT ('cls_' || substr(md5(random()::text), 1, 16)),
    client_request_id TEXT NOT NULL UNIQUE REFERENCES client_requests(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL CHECK (outcome IN ('in_scope', 'out_of_scope', 'needs_review')),
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 0.85,
    reasoning TEXT NOT NULL,
    cited_source_excerpts JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_hours NUMERIC(6, 2) DEFAULT 0,
    suggested_cost NUMERIC(10, 2) DEFAULT 0,
    suggested_schedule_days INT DEFAULT 0,
    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    reviewer_notes TEXT,
    classified_by TEXT NOT NULL DEFAULT 'ScopePilot AI 1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Change Orders
CREATE TABLE IF NOT EXISTS change_orders (
    id TEXT PRIMARY KEY DEFAULT ('cho_' || substr(md5(random()::text), 1, 16)),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_request_id TEXT REFERENCES client_requests(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    schedule_delay_days INT NOT NULL DEFAULT 0,
    revised_delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent_to_client', 'approved', 'rejected', 'canceled')),
    client_access_token TEXT UNIQUE NOT NULL DEFAULT ('co_' || substr(md5(random()::text), 1, 24)),
    token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Approvals
CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY DEFAULT ('app_' || substr(md5(random()::text), 1, 16)),
    change_order_id TEXT NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
    approver_name TEXT NOT NULL,
    approver_email TEXT NOT NULL,
    approver_title TEXT,
    signature_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    rejection_reason TEXT,
    client_feedback TEXT,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Events (Immutable log)
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY DEFAULT ('evt_' || substr(md5(random()::text), 1, 16)),
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('freelancer', 'client', 'system_ai')),
    actor_id TEXT NOT NULL DEFAULT 'system',
    actor_name TEXT NOT NULL DEFAULT 'ScopePilot System',
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & tenancy
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_portal ON projects(portal_token);
CREATE INDEX IF NOT EXISTS idx_source_docs_proj ON source_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_proj ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_requests_proj ON client_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_proj ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_token ON change_orders(client_access_token);
CREATE INDEX IF NOT EXISTS idx_audit_events_proj ON audit_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_org ON audit_events(org_id, created_at DESC);
