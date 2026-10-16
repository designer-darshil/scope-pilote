-- Realistic Demo Seed Data for ScopePilot
-- Demonstrates multi-tenant isolation, SOW documents, structured deliverables,
-- AI classifications with citations, change orders, approvals, and immutable audit logs.

INSERT INTO organizations (id, name, slug, plan_tier, settings)
VALUES (
    'org_apex_studio',
    'Apex Digital Studio',
    'apex-digital',
    'growth',
    '{"auto_classify": true, "require_approval_signature": true, "notification_email": "alex@apexdigital.dev"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO memberships (id, org_id, user_id, user_email, user_name, role)
VALUES (
    'mem_alex_01',
    'org_apex_studio',
    'usr_alex_vance',
    'alex@apexdigital.dev',
    'Alex Vance',
    'owner'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (id, org_id, status, plan_id, monthly_request_limit)
VALUES (
    'sub_apex_01',
    'org_apex_studio',
    'active',
    'growth',
    200
) ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, org_id, name, company_name, contact_email, contact_phone, billing_currency, hourly_rate)
VALUES (
    'cli_meridian',
    'org_apex_studio',
    'Sarah Chen',
    'Meridian Retail Inc.',
    'sarah@meridianretail.com',
    '+1 (555) 234-8901',
    'USD',
    150.00
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO projects (id, org_id, client_id, name, code, status, contract_value, portal_token, portal_enabled, active_scope_version, scope_drift_score, recovered_revenue)
VALUES (
    'prj_meridian_store',
    'org_apex_studio',
    'cli_meridian',
    'Meridian E-Commerce Storefront & Mobile Portal',
    'PRJ-MER-2026',
    'active',
    38000.00,
    'portal_meridian_live_demo',
    true,
    1,
    28.50,
    4500.00
) ON CONFLICT (id) DO UPDATE SET portal_token = EXCLUDED.portal_token;

-- Source Document: Signed Statement of Work
INSERT INTO source_documents (id, project_id, org_id, title, document_type, file_name, file_size_bytes, mime_type, extracted_text, version)
VALUES (
    'doc_sow_meridian_01',
    'prj_meridian_store',
    'org_apex_studio',
    'Meridian-ECommerce-SOW-v1.0.pdf',
    'statement_of_work',
    'Meridian-ECommerce-SOW-v1.0.pdf',
    248000,
    'application/pdf',
    'STATEMENT OF WORK (SOW) - MERIDIAN RETAIL INC.
1.0 PROJECT OVERVIEW
Apex Digital Studio agrees to design and develop a headless e-commerce storefront for Meridian Retail Inc. using Next.js and Shopify Storefront API.

2.0 IN-SCOPE DELIVERABLES
2.1 Product Catalog & Navigation: Responsive catalog with faceted category filtering, keyword search, brand tags, and product detail pages with gallery view.
2.2 Cart & Checkout: Standard Shopify hosted checkout integration in United States Dollars (USD).
2.3 Customer Accounts: Self-service portal for customers to view order status, shipping track links, and update shipping addresses.
2.4 Transactional Messaging: Automated email notifications via SendGrid for order confirmation and shipping notices.

3.0 TIMELINE & FIXED FEE
Total fixed fee: $38,000 USD. Targeted completion: 10 weeks from deposit.

4.0 EXPLICIT BOUNDARIES & EXCLUSIONS
4.1 Payment Gateways: Only native Shopify Payments (Credit Card, Apple Pay) are supported. Cryptocurrency, BitPay, or secondary gateways are excluded.
4.2 Business Tiers: Wholesale B2B pricing, net-30 terms, and tiered bulk distributor rates are strictly excluded from Phase 1.
4.3 Loyalty & Rewards: Custom point accrual and reward wallet engines are outside this scope and will require an addendum.',
    1
) ON CONFLICT (id) DO NOTHING;

-- Deliverables Checklist
INSERT INTO deliverables (id, project_id, org_id, source_doc_id, title, category, description, acceptance_criteria, is_explicitly_excluded, order_index)
VALUES 
(
    'del_01',
    'prj_meridian_store',
    'org_apex_studio',
    'doc_sow_meridian_01',
    'Next.js Responsive Storefront & Catalog',
    'Core Feature',
    'Product catalog with faceted category filtering, keyword search, and product details.',
    'Mobile Lighthouse score >= 90; search returns results in < 200ms.',
    false,
    1
),
(
    'del_02',
    'prj_meridian_store',
    'org_apex_studio',
    'doc_sow_meridian_01',
    'Shopify Headless Checkout (USD)',
    'Core Feature',
    'Cart session synchronization with Shopify hosted checkout in USD currency.',
    'Customers can add items to cart and successfully complete transactions via Shopify Payments.',
    false,
    2
),
(
    'del_03',
    'prj_meridian_store',
    'org_apex_studio',
    'doc_sow_meridian_01',
    'Customer Account Portal',
    'Core Feature',
    'Customer profile, order history, shipping addresses, passwordless login.',
    'Customers can view real-time tracking numbers and reprint past receipts.',
    false,
    3
),
(
    'del_04',
    'prj_meridian_store',
    'org_apex_studio',
    'doc_sow_meridian_01',
    'Transactional Email Pipeline',
    'Infrastructure',
    'SendGrid email templates for purchase receipts and shipping notifications.',
    'Deliverability test passes DKIM/SPF verification.',
    false,
    4
),
(
    'del_05_ex',
    'prj_meridian_store',
    'org_apex_studio',
    'doc_sow_meridian_01',
    'Wholesale B2B Pricing Tiers & Net-30 Terms',
    'Out of Scope Boundary',
    'Wholesale tiered bulk pricing, business tax exempt IDs, and Net-30 invoice terms.',
    'Explicitly excluded in SOW Section 4.2; requires separate Change Order.',
    true,
    5
),
(
    'del_06_ex',
    'prj_meridian_store',
    'org_apex_studio',
    'doc_sow_meridian_01',
    'Cryptocurrency & Custom Rewards Engine',
    'Out of Scope Boundary',
    'BitPay crypto checkout and custom point accrual/redemption system.',
    'Explicitly excluded in SOW Section 4.1 & 4.3; requires separate Change Order.',
    true,
    6
)
ON CONFLICT (id) DO NOTHING;

-- Client Request 1 (Approved Change Order)
INSERT INTO client_requests (id, project_id, org_id, request_number, title, raw_message, submitted_by_name, submitted_by_email, urgency, status)
VALUES (
    'req_001',
    'prj_meridian_store',
    'org_apex_studio',
    101,
    'Wholesale B2B Pricing Tier & Company Invoicing',
    'Hey Alex, our executive board decided we need wholesale distributors to purchase bulk units with net-30 terms before holiday launch. Can we get this added?',
    'Sarah Chen',
    'sarah@meridianretail.com',
    'high',
    'change_order_created'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO classifications (id, client_request_id, project_id, outcome, confidence_score, reasoning, cited_source_excerpts, suggested_hours, suggested_cost, suggested_schedule_days, classified_by)
VALUES (
    'cls_001',
    'req_001',
    'prj_meridian_store',
    'out_of_scope',
    0.98,
    'The request explicitly asks for wholesale B2B pricing and net-30 invoice terms, which are explicitly listed as excluded under Section 4.2 of the signed SOW.',
    '[{"document_id": "doc_sow_meridian_01", "document_title": "Meridian-ECommerce-SOW-v1.0.pdf", "section": "Section 4.2", "excerpt": "Wholesale B2B pricing, net-30 terms, and tiered bulk distributor rates are strictly excluded from Phase 1.", "relevance": "Direct negative match (explicit exclusion)"}]'::jsonb,
    30.00,
    4500.00,
    8,
    'ScopePilot AI 1.0'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO change_orders (id, project_id, org_id, client_request_id, order_number, title, description, line_items, total_amount, currency, schedule_delay_days, status, client_access_token, sent_at)
VALUES (
    'cho_001',
    'prj_meridian_store',
    'org_apex_studio',
    'req_001',
    'CO-2026-001',
    'B2B Wholesale Pricing & Net-30 Terms Extension',
    'Scope expansion to implement distributor account verification, custom volume pricing rules, and manual invoice approval checkout workflow.',
    '[{"id": "item-1", "description": "B2B customer tax-exemption verification & tiered price rules", "hours": 16, "rate": 150, "amount": 2400}, {"id": "item-2", "description": "Net-30 invoice order routing and PDF invoice generation", "hours": 14, "rate": 150, "amount": 2100}]'::jsonb,
    4500.00,
    'USD',
    8,
    'approved',
    'co_token_meridian_001',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (id, change_order_id, decision, approver_name, approver_email, approver_title, signature_data, ip_address, decided_at)
VALUES (
    'app_001',
    'cho_001',
    'approved',
    'Sarah Chen',
    'sarah@meridianretail.com',
    'VP of Digital Products',
    'Sarah Chen [Signed Digitally via ScopePilot Portal]',
    '198.51.100.42',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Client Request 2 (Accepted in Scope)
INSERT INTO client_requests (id, project_id, org_id, request_number, title, raw_message, submitted_by_name, submitted_by_email, urgency, status)
VALUES (
    'req_002',
    'prj_meridian_store',
    'org_apex_studio',
    102,
    'Faceted Brand Filters and Typo-Tolerant Search',
    'Hi team! When testing the staging site, we noticed that typing "addidas" with two d''s doesn''t show the brand. Can we ensure the search handles minor typos and lets users filter by brand names?',
    'Sarah Chen',
    'sarah@meridianretail.com',
    'medium',
    'accepted_in_scope'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO classifications (id, client_request_id, project_id, outcome, confidence_score, reasoning, cited_source_excerpts, suggested_hours, suggested_cost, suggested_schedule_days, classified_by)
VALUES (
    'cls_002',
    'req_002',
    'prj_meridian_store',
    'in_scope',
    0.95,
    'The agreed SOW Section 2.1 explicitly includes product catalog search, brand tags, and faceted filtering. Typo tolerance is part of standard search quality.',
    '[{"document_id": "doc_sow_meridian_01", "document_title": "Meridian-ECommerce-SOW-v1.0.pdf", "section": "Section 2.1", "excerpt": "Responsive catalog with faceted category filtering, keyword search, brand tags, and product detail pages.", "relevance": "Direct positive match"}]'::jsonb,
    0,
    0,
    0,
    'ScopePilot AI 1.0'
) ON CONFLICT (id) DO NOTHING;

-- Client Request 3 (Active Out-of-Scope request ready for demo workflow!)
INSERT INTO client_requests (id, project_id, org_id, request_number, title, raw_message, submitted_by_name, submitted_by_email, urgency, status)
VALUES (
    'req_003',
    'prj_meridian_store',
    'org_apex_studio',
    103,
    'Loyalty Reward Points & Crypto Checkout via BitPay',
    'Alex, our CMO wants customers to earn 5 points per dollar spent and redeem them at checkout. Also, we want to accept Bitcoin/Ethereum via BitPay before Black Friday. Please confirm this is included!',
    'Sarah Chen',
    'sarah@meridianretail.com',
    'critical',
    'classified'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO classifications (id, client_request_id, project_id, outcome, confidence_score, reasoning, cited_source_excerpts, suggested_hours, suggested_cost, suggested_schedule_days, classified_by)
VALUES (
    'cls_003',
    'req_003',
    'prj_meridian_store',
    'out_of_scope',
    0.97,
    'Both features are explicitly forbidden in the signed agreement. Section 4.1 explicitly states cryptocurrency/BitPay is excluded, and Section 4.3 states custom loyalty reward engines require an addendum.',
    '[{"document_id": "doc_sow_meridian_01", "document_title": "Meridian-ECommerce-SOW-v1.0.pdf", "section": "Section 4.1", "excerpt": "Payment Gateways: Only native Shopify Payments (Credit Card, Apple Pay) are supported. Cryptocurrency, BitPay, or secondary gateways are excluded.", "relevance": "Direct negative match"}, {"document_id": "doc_sow_meridian_01", "document_title": "Meridian-ECommerce-SOW-v1.0.pdf", "section": "Section 4.3", "excerpt": "Loyalty & Rewards: Custom point accrual and reward wallet engines are outside this scope and will require an addendum.", "relevance": "Direct negative match"}]'::jsonb,
    34.00,
    5100.00,
    10,
    'ScopePilot AI 1.0'
) ON CONFLICT (id) DO NOTHING;

-- Client Request 4 (Needs Review)
INSERT INTO client_requests (id, project_id, org_id, request_number, title, raw_message, submitted_by_name, submitted_by_email, urgency, status)
VALUES (
    'req_004',
    'prj_meridian_store',
    'org_apex_studio',
    104,
    'Automated Scheduled CSV Export for Daily Warehouse Shipments',
    'Can you add an automated nightly cron job that emails a formatted CSV of all pending warehouse orders to our 3PL logistics provider in Chicago?',
    'Sarah Chen',
    'sarah@meridianretail.com',
    'medium',
    'classified'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO classifications (id, client_request_id, project_id, outcome, confidence_score, reasoning, cited_source_excerpts, suggested_hours, suggested_cost, suggested_schedule_days, classified_by)
VALUES (
    'cls_004',
    'req_004',
    'prj_meridian_store',
    'needs_review',
    0.62,
    'Section 2.4 specifies SendGrid transactional emails for customer notifications, but automated 3PL cron sync and custom CSV data transforms are neither explicitly included nor explicitly excluded. Human review is recommended.',
    '[{"document_id": "doc_sow_meridian_01", "document_title": "Meridian-ECommerce-SOW-v1.0.pdf", "section": "Section 2.4", "excerpt": "Transactional Messaging: Automated email notifications via SendGrid for order confirmation and shipping notices.", "relevance": "Partial related match"}]'::jsonb,
    12.00,
    1800.00,
    4,
    'ScopePilot AI 1.0'
) ON CONFLICT (id) DO NOTHING;

-- Audit Events
INSERT INTO audit_events (id, org_id, project_id, event_type, actor_type, actor_id, actor_name, target_type, target_id, metadata)
VALUES
(
    'evt_001',
    'org_apex_studio',
    'prj_meridian_store',
    'project.created',
    'freelancer',
    'usr_alex_vance',
    'Alex Vance',
    'project',
    'prj_meridian_store',
    '{"name": "Meridian E-Commerce Storefront", "contract_value": 38000}'::jsonb
),
(
    'evt_002',
    'org_apex_studio',
    'prj_meridian_store',
    'sow.uploaded',
    'freelancer',
    'usr_alex_vance',
    'Alex Vance',
    'source_document',
    'doc_sow_meridian_01',
    '{"title": "Meridian-ECommerce-SOW-v1.0.pdf", "deliverables_extracted": 6}'::jsonb
),
(
    'evt_003',
    'org_apex_studio',
    'prj_meridian_store',
    'request.received',
    'client',
    'sarah@meridianretail.com',
    'Sarah Chen',
    'client_request',
    'req_001',
    '{"request_number": 101, "title": "Wholesale B2B Pricing Tier"}'::jsonb
),
(
    'evt_004',
    'org_apex_studio',
    'prj_meridian_store',
    'ai.classified',
    'system_ai',
    'ai-model',
    'ScopePilot AI 1.0',
    'classification',
    'cls_001',
    '{"outcome": "out_of_scope", "confidence": 0.98, "suggested_cost": 4500}'::jsonb
),
(
    'evt_005',
    'org_apex_studio',
    'prj_meridian_store',
    'change_order.approved',
    'client',
    'sarah@meridianretail.com',
    'Sarah Chen',
    'change_order',
    'cho_001',
    '{"order_number": "CO-2026-001", "amount": 4500, "delay_days": 8, "approver": "Sarah Chen"}'::jsonb
),
(
    'evt_006',
    'org_apex_studio',
    'prj_meridian_store',
    'request.received',
    'client',
    'sarah@meridianretail.com',
    'Sarah Chen',
    'client_request',
    'req_003',
    '{"request_number": 103, "title": "Loyalty Reward Points & Crypto Checkout"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
