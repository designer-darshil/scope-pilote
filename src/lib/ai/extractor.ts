export interface ExtractedDeliverable {
  title: string;
  category: string;
  description: string;
  acceptanceCriteria: string;
  isExplicitlyExcluded: boolean;
}

/**
 * Parses raw SOW text, proposal, or client brief into structured deliverables.
 * Extracts categories, explicit exclusions, and key acceptance criteria.
 */
export function extractDeliverablesFromText(rawText: string): ExtractedDeliverable[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const deliverables: ExtractedDeliverable[] = [];

  // Look for sections or bullet points
  let currentSection = 'General';
  let isExclusionSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Check if entering exclusions / out of scope section
    if (lower.includes('out of scope') || lower.includes('exclusion') || lower.includes('boundaries') || lower.includes('not included')) {
      isExclusionSection = true;
      currentSection = 'Out of Scope Boundary';
      continue;
    }

    if (lower.includes('deliverable') || lower.includes('scope of work') || lower.includes('phase')) {
      isExclusionSection = false;
      currentSection = 'Core Feature';
      continue;
    }

    // Numbered item or bullet point: e.g. "2.1 Product Catalog: description" or "- Feature: description"
    const match = line.match(/^(\d+(\.\d+)*\s*[-:.)]|[*•-]\s+)(.+)/);
    if (match) {
      const fullContent = match[3].trim();
      const parts = fullContent.split(/[:–—]/);
      const title = parts[0].trim();
      const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : fullContent;

      deliverables.push({
        title,
        category: isExclusionSection ? 'Out of Scope Boundary' : currentSection,
        description: desc,
        acceptanceCriteria: isExclusionSection ? 'Explicitly excluded from scope.' : 'Meets specifications and passes acceptance QA.',
        isExplicitlyExcluded: isExclusionSection || lower.includes('exclude') || lower.includes('out of scope'),
      });
    }
  }

  // If simple parsing found fewer than 2 items, provide sensible default structure
  if (deliverables.length === 0) {
    deliverables.push(
      {
        title: 'Core Application Architecture',
        category: 'Core Feature',
        description: 'Complete baseline system architecture according to initial specification.',
        acceptanceCriteria: 'Application deployed and operational in production staging.',
        isExplicitlyExcluded: false,
      },
      {
        title: 'User Interface & Core Workflows',
        category: 'Design/UI',
        description: 'Primary user navigation, forms, responsive layouts, and authentication.',
        acceptanceCriteria: 'Validated against agreed wireframes and mobile views.',
        isExplicitlyExcluded: false,
      },
      {
        title: 'Custom Third-Party Additions & Crypto Gateways',
        category: 'Out of Scope Boundary',
        description: 'Any external integrations not explicitly itemized in the proposal.',
        acceptanceCriteria: 'Requires formal Change Order and budget approval.',
        isExplicitlyExcluded: true,
      }
    );
  }

  return deliverables;
}
