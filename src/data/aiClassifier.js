// ============================================
// CivicPulse — AI Classifier (Mock)
// ============================================

import { CATEGORIES, DEPARTMENTS } from './mockData';

// Keyword maps for classification
const KEYWORD_MAP = {
  pothole: ['pothole', 'hole', 'road damage', 'crater', 'broken road', 'road repair', 'asphalt', 'dip', 'bump', 'uneven road', 'road surface', 'tire damage', 'footpath', 'pavement'],
  streetlight: ['streetlight', 'street light', 'lamp', 'light out', 'dark street', 'no light', 'lighting', 'bulb', 'pole light', 'LED', 'illumination', 'flickering light'],
  water: ['water', 'leak', 'pipe', 'supply', 'pipeline', 'flooding', 'water main', 'tap', 'no water', 'water pressure', 'contaminated', 'tanker', 'bore well', 'water cut'],
  sanitation: ['garbage', 'trash', 'waste', 'dump', 'bin', 'rubbish', 'litter', 'debris', 'sewage', 'smell', 'unhygienic', 'cleaning', 'sweeping', 'overflowing'],
  parks: ['park', 'garden', 'tree', 'bench', 'playground', 'swing', 'green space', 'lawn', 'hedge', 'fountain', 'botanical', 'jogging track'],
  traffic: ['traffic', 'signal', 'junction', 'crossing', 'jam', 'congestion', 'speed', 'accident', 'zebra crossing', 'road sign', 'divider', 'barricade'],
  noise: ['noise', 'loud', 'construction', 'horn', 'speaker', 'music', 'disturbance', 'decibel', 'quiet zone', 'night time', 'sound pollution'],
  drainage: ['drain', 'drainage', 'waterlogging', 'manhole', 'sewer', 'gutter', 'storm drain', 'clog', 'blocked drain', 'cover', 'open drain'],
};

const SEVERITY_KEYWORDS = {
  critical: ['emergency', 'urgent', 'danger', 'critical', 'life threatening', 'accident', 'flooding', 'collapse', 'child', 'elderly', 'fatal', 'fire', 'explosion'],
  high: ['dangerous', 'unsafe', 'broken', 'damaged', 'major', 'severe', '2 weeks', 'multiple', 'hazard', 'risk', 'falling', 'exposed wire'],
  medium: ['inconvenient', 'annoying', 'moderate', 'affecting', 'several', 'days', 'smell', 'overflow'],
  low: ['minor', 'small', 'cosmetic', 'aesthetic', 'paint', 'slightly', 'worn'],
};

/**
 * Classify text into a category and severity using keyword matching
 * Returns a structured result mimicking an AI API response
 */
export function classifyIssue(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();

  // Category classification
  const categoryScores = {};
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // Title matches get higher weight
        const inTitle = title.toLowerCase().includes(keyword);
        score += inTitle ? 3 : 1;
      }
    }
    if (score > 0) categoryScores[category] = score;
  }

  // Find best category
  const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
  const bestCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'pothole';
  const maxScore = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

  // Calculate confidence (0.5 - 0.98)
  const totalScore = Object.values(categoryScores).reduce((sum, s) => sum + s, 0);
  let confidence = totalScore > 0 ? maxScore / totalScore : 0.5;
  confidence = Math.max(0.55, Math.min(0.98, confidence * 0.8 + 0.3));

  // Severity classification
  let severity = 'medium';
  for (const [sev, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        severity = sev;
        break;
      }
    }
    if (severity !== 'medium' || sev === 'medium') break;
  }

  // More refined severity check
  if (severity === 'medium') {
    const wordCount = text.split(' ').length;
    if (wordCount > 50) severity = 'high'; // Longer descriptions often mean bigger problems
  }

  // Find department
  const dept = DEPARTMENTS.find(d => d.categories.includes(bestCategory));
  const categoryMeta = CATEGORIES.find(c => c.id === bestCategory);

  // Possible duplicates (for demo, we just return empty)
  const possibleDuplicates = [];

  return {
    category: bestCategory,
    categoryLabel: categoryMeta?.label || bestCategory,
    categoryIcon: categoryMeta?.icon || '📌',
    severity,
    confidence: Math.round(confidence * 100) / 100,
    department: dept?.id || null,
    departmentName: dept?.name || 'Unassigned',
    tags: extractTags(text),
    possibleDuplicates,
    reasoning: generateReasoning(bestCategory, severity, confidence, sortedCategories),
  };
}

function extractTags(text) {
  const tags = [];
  if (text.includes('road') || text.includes('street')) tags.push('road');
  if (text.includes('water')) tags.push('water');
  if (text.includes('safety') || text.includes('dangerous') || text.includes('unsafe')) tags.push('safety');
  if (text.includes('night')) tags.push('nighttime');
  if (text.includes('rain') || text.includes('monsoon')) tags.push('weather-related');
  if (text.includes('child') || text.includes('school')) tags.push('child-safety');
  if (text.includes('traffic') || text.includes('vehicle')) tags.push('traffic');
  if (text.includes('environment') || text.includes('pollution') || text.includes('lake')) tags.push('environment');
  return tags.slice(0, 4);
}

function generateReasoning(category, severity, confidence, allScores) {
  const cat = CATEGORIES.find(c => c.id === category);
  let reasoning = `Classified as **${cat?.label || category}** with ${Math.round(confidence * 100)}% confidence. `;

  if (severity === 'critical') {
    reasoning += 'Marked as **critical** due to safety-related keywords detected. ';
  } else if (severity === 'high') {
    reasoning += 'Severity assessed as **high** based on impact indicators. ';
  }

  if (allScores.length > 1) {
    const second = CATEGORIES.find(c => c.id === allScores[1][0]);
    reasoning += `Secondary match: ${second?.label || allScores[1][0]}.`;
  }

  return reasoning;
}

/**
 * Check for duplicate issues using simple Jaccard similarity
 */
export function findDuplicates(title, existingIssues) {
  const titleTokens = new Set(title.toLowerCase().split(/\s+/).filter(t => t.length > 2));

  return existingIssues
    .map(issue => {
      const issueTokens = new Set(issue.title.toLowerCase().split(/\s+/).filter(t => t.length > 2));
      const intersection = new Set([...titleTokens].filter(t => issueTokens.has(t)));
      const union = new Set([...titleTokens, ...issueTokens]);
      const similarity = union.size > 0 ? intersection.size / union.size : 0;
      return { issue, similarity };
    })
    .filter(r => r.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
}
