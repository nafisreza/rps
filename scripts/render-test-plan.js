// Renders TEST_PLAN.md from tests/test-cases.json so the document,
// the automated suite and the Jira tickets stay in sync.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "tests", "test-cases.json");
const out = path.join(__dirname, "..", "TEST_PLAN.md");
const { project, testCases } = JSON.parse(fs.readFileSync(src, "utf8"));

const byType = (t) => testCases.filter((c) => c.type === t);
const lines = [];

lines.push(`# Test Plan — ${project}`);
lines.push("");
lines.push("## 1. Introduction");
lines.push("");
lines.push(
  "This test plan covers functional testing of the IUT Result Processing System (RPS): grading and GPA/CGPA computation, authentication and authorization, the marks entry workflow (draft → submit → approve/reject), course management, student result views and PDF generation."
);
lines.push("");
lines.push("## 2. Test Strategy");
lines.push("");
lines.push("| Level | Tool | Location | Count |");
lines.push("|---|---|---|---|");
lines.push(`| Unit | Vitest | \`tests/unit/\` | ${byType("Unit").length} |`);
lines.push(`| API / Integration | Vitest (against running app) | \`tests/api/\` | ${byType("API").length} |`);
lines.push(`| End-to-End | Playwright (Chromium) | \`tests/e2e/\` | ${byType("E2E").length} |`);
lines.push(`| **Total** | | | **${testCases.length}** |`);
lines.push("");
lines.push("**Environment:** app + PostgreSQL running via `docker compose up` on `http://localhost:3000`, database seeded with `npx prisma db seed`.");
lines.push("");
lines.push("**How to run:** `npm test` (unit + API), `npm run test:e2e` (E2E), `npm run test:all` (everything).");
lines.push("");
lines.push("## 3. Test Case Summary");
lines.push("");
lines.push("| ID | Title | Type | Area | Priority |");
lines.push("|---|---|---|---|---|");
for (const c of testCases) {
  lines.push(`| ${c.id} | ${c.title} | ${c.type} | ${c.area} | ${c.priority} |`);
}
lines.push("");
lines.push("## 4. Detailed Test Cases");
lines.push("");
for (const c of testCases) {
  lines.push(`### ${c.id}: ${c.title}`);
  lines.push("");
  lines.push(`- **Type:** ${c.type} · **Area:** ${c.area} · **Priority:** ${c.priority}`);
  lines.push(`- **Preconditions:** ${c.preconditions}`);
  lines.push(`- **Steps:**`);
  c.steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
  lines.push(`- **Expected result:** ${c.expected}`);
  lines.push(`- **Automated in:** \`${c.automated_in}\``);
  lines.push("");
}

fs.writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out} with ${testCases.length} test cases.`);
