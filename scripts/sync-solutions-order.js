#!/usr/bin/env node
// Keeps welcome.mdx solution ordering in sync with the Solutions tab in docs.json.
// Run manually: node scripts/sync-solutions-order.js
// Also runs automatically via Claude Code hook when docs.json is edited.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS_JSON = path.join(ROOT, 'docs.json');
const WELCOME_MDX = path.join(ROOT, 'welcome.mdx');

// Display names for each page path as they appear on the homepage.
// Update this map if a page is renamed or a new use case is added.
const PAGE_NAMES = {
  'embedded-wallets/code-examples/embedded-consumer-wallet': 'Embedded Consumer Wallets',
  'products/embedded-business-wallets/overview': 'Embedded Business Wallets',
  'embedded-wallets/embedded-waas': 'Wallets-as-a-Service',
  'products/embedded-wallets/features/agentic-wallets': 'Agentic Wallets',
  'company-wallets/code-examples/signing-transactions': 'Signing Transactions',
  'company-wallets/code-examples/smart-contract-management': 'Smart Contract Management',
  'company-wallets/code-examples/payment-orchestration': 'Payment Orchestration',
  'company-wallets/use-cases/agentic-wallets': 'Agentic Wallets',
};

function getUseCases(docsJson, tabName, groupName) {
  const tab = docsJson.navigation.tabs.find(t => t.tab === tabName);
  if (!tab) return [];
  const group = tab.groups.find(g => g.group === groupName);
  if (!group) return [];
  const useCasesGroup = group.pages.find(p => typeof p === 'object' && p.group === 'Use cases');
  if (!useCasesGroup) return [];
  return useCasesGroup.pages.filter(p => typeof p === 'string' && PAGE_NAMES[p]);
}

function buildList(pages) {
  return pages.map((p, i) => `    ${i + 1}. [${PAGE_NAMES[p]}](/${p})`).join('\n');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceSection(content, marker, newList) {
  const start = `{/* sync-start: ${marker} */}`;
  const end = `{/* sync-end: ${marker} */}`;
  const re = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`);
  const replacement = `${start}\n${newList}\n  ${end}`;
  if (!re.test(content)) {
    console.warn(`Warning: marker "${marker}" not found in welcome.mdx — skipping.`);
    return content;
  }
  return content.replace(re, replacement);
}

const docsJson = JSON.parse(fs.readFileSync(DOCS_JSON, 'utf8'));
const embeddedPages = getUseCases(docsJson, 'Solutions', 'Embedded Wallets');
const companyPages  = getUseCases(docsJson, 'Solutions', 'Company Wallets');

let welcome = fs.readFileSync(WELCOME_MDX, 'utf8');
welcome = replaceSection(welcome, 'embedded-wallets-use-cases', buildList(embeddedPages));
welcome = replaceSection(welcome, 'company-wallets-use-cases',  buildList(companyPages));
fs.writeFileSync(WELCOME_MDX, welcome);

console.log('✓ welcome.mdx solution ordering synced from docs.json');
