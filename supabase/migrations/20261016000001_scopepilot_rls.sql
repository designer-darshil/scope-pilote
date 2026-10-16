-- Row Level Security (RLS) Policies for ScopePilot
-- Enforces tenant isolation so that users can only access data belonging to their organization
-- Public portal tokens provide isolated, read/write access strictly to the assigned project/change-order

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org IDs
CREATE OR REPLACE FUNCTION current_user_org_ids()
RETURNS TABLE (org_id TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT m.org_id
    FROM memberships m
    WHERE m.user_id = auth.uid()::text OR m.user_email = auth.jwt()->>'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Projects Policy: Org members can manage their own org's projects
CREATE POLICY projects_org_isolation ON projects
    FOR ALL
    USING (org_id IN (SELECT org_id FROM current_user_org_ids()))
    WITH CHECK (org_id IN (SELECT org_id FROM current_user_org_ids()));

-- Deliverables Policy
CREATE POLICY deliverables_org_isolation ON deliverables
    FOR ALL
    USING (org_id IN (SELECT org_id FROM current_user_org_ids()))
    WITH CHECK (org_id IN (SELECT org_id FROM current_user_org_ids()));

-- Client Requests Policy
CREATE POLICY client_requests_org_isolation ON client_requests
    FOR ALL
    USING (org_id IN (SELECT org_id FROM current_user_org_ids()))
    WITH CHECK (org_id IN (SELECT org_id FROM current_user_org_ids()));

-- Change Orders Policy
CREATE POLICY change_orders_org_isolation ON change_orders
    FOR ALL
    USING (org_id IN (SELECT org_id FROM current_user_org_ids()))
    WITH CHECK (org_id IN (SELECT org_id FROM current_user_org_ids()));

-- Audit Events Policy
CREATE POLICY audit_events_org_isolation ON audit_events
    FOR ALL
    USING (org_id IN (SELECT org_id FROM current_user_org_ids()));
