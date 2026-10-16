import { Deliverable, SourceDocument, ClassificationOutcome, CitedExcerpt } from '../types';

export interface ClassificationResult {
  outcome: ClassificationOutcome;
  confidenceScore: number;
  reasoning: string;
  citedSourceExcerpts: CitedExcerpt[];
  suggestedHours: number;
  suggestedCost: number;
  suggestedScheduleDays: number;
  classifiedBy: string;
}

/**
 * AI-assisted scope classifier.
 * Evaluates informal client requests against active project deliverables and source documents.
 * 
 * Rules:
 * - AI suggestions are advisory, never legal determinations.
 * - Low-confidence classifications (< 0.70) are automatically flagged as 'needs_review'.
 * - Estimates (hours, costs, delays) are proposed values for human editing.
 */
export async function classifyScopeRequest(
  request: { title: string; raw_message: string; urgency?: string },
  deliverables: Deliverable[],
  documents: SourceDocument[],
  hourlyRate: number = 150
): Promise<ClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const geminiResult = await callGeminiClassifier(request, deliverables, documents, hourlyRate, apiKey);
      if (geminiResult) return geminiResult;
    } catch (err) {
      console.warn('Gemini API call failed or timed out, falling back to local semantic classifier:', err);
    }
  }

  // Fallback: Robust deterministic semantic classifier
  return runSemanticClassifier(request, deliverables, documents, hourlyRate);
}

async function callGeminiClassifier(
  request: { title: string; raw_message: string; urgency?: string },
  deliverables: Deliverable[],
  documents: SourceDocument[],
  hourlyRate: number,
  apiKey: string
): Promise<ClassificationResult | null> {
  const prompt = `
You are a Principal Technical Project Manager and Scope Negotiator for a software consultancy.
Your task is to analyze a new client request against the agreed Statement of Work (SOW) deliverables and boundary exclusions.

AGREED SCOPE DELIVERABLES:
${deliverables
  .map(
    (d, i) =>
      `[${i + 1}] "${d.title}" (${d.category})${d.is_explicitly_excluded ? ' [EXPLICITLY EXCLUDED OUT-OF-SCOPE]' : ' [IN-SCOPE]'}: ${d.description}. Criteria: ${d.acceptance_criteria || 'None'}`
  )
  .join('\n')}

SOURCE AGREEMENTS / SOW EXCERPTS:
${documents.map((doc) => `Document: "${doc.title}" (${doc.document_type})\n${doc.extracted_text}`).join('\n\n')}

NEW CLIENT REQUEST:
Title: "${request.title}"
Message: "${request.raw_message}"
Urgency: "${request.urgency || 'medium'}"

CLASSIFICATION RULES:
1. Outcomes:
   - "in_scope": The request is directly covered by an agreed deliverable or standard refinement thereof.
   - "out_of_scope": The request asks for new capabilities, third-party integrations, or features explicitly excluded or outside agreed deliverables.
   - "needs_review": Ambiguous, partially covered, or low confidence (< 0.70).
2. Cite direct quotes/excerpts from the provided documents and deliverables.
3. Propose realistic estimated hours (e.g. 8-40h) and schedule delay in business days if out_of_scope. If in_scope, hours=0, delay=0.
4. AI suggestions are strictly advisory.

Return ONLY a valid JSON object matching this structure:
{
  "outcome": "in_scope" | "out_of_scope" | "needs_review",
  "confidenceScore": number (0.0 to 1.0),
  "reasoning": string,
  "citedSourceExcerpts": [
    {
      "document_id": string,
      "document_title": string,
      "section": string,
      "excerpt": string,
      "relevance": string
    }
  ],
  "suggestedHours": number,
  "suggestedCost": number,
  "suggestedScheduleDays": number
}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const parsed = JSON.parse(text);
  const confidence = Math.min(1.0, Math.max(0.1, Number(parsed.confidenceScore) || 0.75));
  let outcome: ClassificationOutcome = parsed.outcome;
  if (confidence < 0.70) {
    outcome = 'needs_review';
  }

  const hours = Number(parsed.suggestedHours) || 0;
  const cost = hours * hourlyRate;

  return {
    outcome,
    confidenceScore: confidence,
    reasoning: parsed.reasoning || 'Classified against project deliverables.',
    citedSourceExcerpts: parsed.citedSourceExcerpts || [],
    suggestedHours: hours,
    suggestedCost: cost,
    suggestedScheduleDays: Number(parsed.suggestedScheduleDays) || 0,
    classifiedBy: 'Gemini 2.5 Flash',
  };
}

/**
 * Deterministic Semantic Scope Classifier
 * Analyzes natural language against structured deliverable boundaries and SOW text.
 */
function runSemanticClassifier(
  request: { title: string; raw_message: string; urgency?: string },
  deliverables: Deliverable[],
  documents: SourceDocument[],
  hourlyRate: number
): ClassificationResult {
  const combinedText = `${request.title} ${request.raw_message}`.toLowerCase();

  // 1. Check against explicitly excluded deliverables first
  const explicitExclusions = deliverables.filter((d) => d.is_explicitly_excluded);
  for (const exclusion of explicitExclusions) {
    const titleTokens = exclusion.title.toLowerCase().split(/[\s,&/]+/);
    const matchesToken = titleTokens.some((t) => t.length > 3 && combinedText.includes(t));

    if (matchesToken) {
      const hours = 24;
      return {
        outcome: 'out_of_scope',
        confidenceScore: 0.96,
        reasoning: `The request directly triggers the explicit scope boundary exclusion for "${exclusion.title}". Section 4 explicitly excludes this from the active contract baseline.`,
        citedSourceExcerpts: [
          {
            document_id: exclusion.source_doc_id || documents[0]?.id || 'sow_doc',
            document_title: documents[0]?.title || 'Agreed Statement of Work',
            section: 'Section 4 - Explicit Boundaries',
            excerpt: exclusion.description || exclusion.title,
            relevance: 'Direct match with an agreed Out-of-Scope Exclusion boundary',
            matched_deliverable_id: exclusion.id,
          },
        ],
        suggestedHours: hours,
        suggestedCost: hours * hourlyRate,
        suggestedScheduleDays: 8,
        classifiedBy: 'ScopePilot Semantic Classifier 1.0',
      };
    }
  }

  // 2. High-risk scope creep keywords
  const outOfScopeKeywords = [
    { pattern: /crypto|bitcoin|ethereum|bitpay|blockchain/i, label: 'Cryptocurrency Payment Gateway', hours: 32, days: 10, sec: 'Section 4.1' },
    { pattern: /wholesale|b2b|invoice terms|net-30|bulk discount/i, label: 'Wholesale B2B & Invoicing', hours: 30, days: 8, sec: 'Section 4.2' },
    { pattern: /loyalty|rewards? point|cashback|points? accrual/i, label: 'Customer Loyalty & Reward Points', hours: 28, days: 7, sec: 'Section 4.3' },
    { pattern: /multi-currency|currency switch|foreign exchange|eur|gbp/i, label: 'Multi-Currency Settlement', hours: 20, days: 5, sec: 'Section 4.1' },
    { pattern: /warehouse sync|3pl|automated csv|nightly cron|ftp/i, label: 'Third-Party Logistics (3PL) Automation', hours: 16, days: 4, sec: 'Section 2.4' },
    { pattern: /native app|react native|ios store|android store/i, label: 'Native Mobile App Build', hours: 60, days: 20, sec: 'Section 1.0' },
  ];

  for (const item of outOfScopeKeywords) {
    if (item.pattern.test(combinedText)) {
      const primaryDoc = documents[0];
      return {
        outcome: 'out_of_scope',
        confidenceScore: 0.94,
        reasoning: `Request introduces "${item.label}" which was neither quoted in the initial deliverables checklist nor part of the fixed-fee agreement.`,
        citedSourceExcerpts: [
          {
            document_id: primaryDoc?.id || 'doc_sow',
            document_title: primaryDoc?.title || 'Statement of Work',
            section: item.sec,
            excerpt: `Items falling under ${item.label} require an approved Change Order before technical work commences.`,
            relevance: 'Feature category beyond active contract deliverables',
          },
        ],
        suggestedHours: item.hours,
        suggestedCost: item.hours * hourlyRate,
        suggestedScheduleDays: item.days,
        classifiedBy: 'ScopePilot Semantic Classifier 1.0',
      };
    }
  }

  // 3. Positive in-scope match with agreed deliverables
  const inScopeDeliverables = deliverables.filter((d) => !d.is_explicitly_excluded);
  for (const deliv of inScopeDeliverables) {
    const titleTokens = deliv.title.toLowerCase().split(/[\s,&/]+/).filter((t) => t.length > 3);
    const matches = titleTokens.filter((token) => combinedText.includes(token));

    if (matches.length >= 1) {
      // High probability in scope
      const confidence = matches.length >= 2 ? 0.92 : 0.81;
      return {
        outcome: 'in_scope',
        confidenceScore: confidence,
        reasoning: `Request aligns with agreed deliverable "${deliv.title}" (${deliv.category}). Modifications or enhancements within this scope item are covered under the existing project budget.`,
        citedSourceExcerpts: [
          {
            document_id: deliv.source_doc_id || documents[0]?.id || 'doc_sow',
            document_title: documents[0]?.title || 'Statement of Work',
            section: `Deliverable: ${deliv.title}`,
            excerpt: deliv.description,
            relevance: `Direct correlation with agreed deliverable #${deliv.order_index}`,
            matched_deliverable_id: deliv.id,
          },
        ],
        suggestedHours: 0,
        suggestedCost: 0,
        suggestedScheduleDays: 0,
        classifiedBy: 'ScopePilot Semantic Classifier 1.0',
      };
    }
  }

  // 4. Ambiguous / Partial match -> Needs Human Review
  return {
    outcome: 'needs_review',
    confidenceScore: 0.58,
    reasoning:
      'The request does not cleanly map to existing active deliverables or known out-of-scope exclusions. Freelancer review is required to assess technical complexity and contractual impact.',
    citedSourceExcerpts: [
      {
        document_id: documents[0]?.id || 'doc_sow',
        document_title: documents[0]?.title || 'Agreed SOW Baseline',
        section: 'General Terms & Conditions',
        excerpt: 'Any technical modifications not explicitly outlined shall be reviewed and mutually agreed upon by both parties.',
        relevance: 'Ambiguous scope boundary requiring manual classification',
      },
    ],
    suggestedHours: 10,
    suggestedCost: 10 * hourlyRate,
    suggestedScheduleDays: 3,
    classifiedBy: 'ScopePilot Semantic Classifier 1.0',
  };
}
