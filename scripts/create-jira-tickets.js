// Creates one Jira Task per test case in tests/test-cases.json.
// Usage:
//   JIRA_SITE=yoursite.atlassian.net JIRA_EMAIL=you@example.com \
//   JIRA_TOKEN=xxxx JIRA_PROJECT=RPS node scripts/create-jira-tickets.js
//
// Skips test cases that already have an issue with the same summary, so the
// script is safe to re-run.
const fs = require("fs");
const path = require("path");

const { JIRA_SITE, JIRA_EMAIL, JIRA_TOKEN, JIRA_PROJECT } = process.env;
if (!JIRA_SITE || !JIRA_EMAIL || !JIRA_TOKEN || !JIRA_PROJECT) {
  console.error("Missing env vars: JIRA_SITE, JIRA_EMAIL, JIRA_TOKEN, JIRA_PROJECT");
  process.exit(1);
}

const BASE = `https://${JIRA_SITE}/rest/api/3`;
const AUTH = "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");

const { testCases } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "tests", "test-cases.json"), "utf8")
);

async function api(pathname, options = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...options,
    headers: {
      Authorization: AUTH,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${pathname} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return body;
}

const text = (t) => ({ type: "paragraph", content: [{ type: "text", text: t }] });
const heading = (t) => ({
  type: "heading",
  attrs: { level: 3 },
  content: [{ type: "text", text: t }],
});

function description(tc) {
  return {
    type: "doc",
    version: 1,
    content: [
      heading("Preconditions"),
      text(tc.preconditions),
      heading("Steps"),
      {
        type: "orderedList",
        content: tc.steps.map((s) => ({ type: "listItem", content: [text(s)] })),
      },
      heading("Expected Result"),
      text(tc.expected),
      heading("Details"),
      text(`Type: ${tc.type} | Area: ${tc.area} | Priority: ${tc.priority}`),
      text(`Automated in: ${tc.automated_in}`),
    ],
  };
}

async function existingSummaries() {
  const summaries = new Set();
  let nextPageToken = undefined;
  do {
    const body = await api("/search/jql", {
      method: "POST",
      body: JSON.stringify({
        jql: `project = ${JIRA_PROJECT} ORDER BY created ASC`,
        fields: ["summary"],
        maxResults: 100,
        ...(nextPageToken ? { nextPageToken } : {}),
      }),
    });
    for (const issue of body.issues || []) summaries.add(issue.fields.summary);
    nextPageToken = body.nextPageToken;
  } while (nextPageToken);
  return summaries;
}

(async () => {
  const me = await api("/myself");
  console.log(`Authenticated as ${me.displayName} on ${JIRA_SITE}`);

  const existing = await existingSummaries();
  let created = 0;
  let skipped = 0;

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const typeLabel = { Unit: "unit-test", API: "api-test", E2E: "e2e-test" };

  for (const tc of testCases) {
    const summary = tc.title;
    if (existing.has(summary)) {
      console.log(`SKIP   ${summary} (already exists)`);
      skipped++;
      continue;
    }
    const issue = await api("/issue", {
      method: "POST",
      body: JSON.stringify({
        fields: {
          project: { key: JIRA_PROJECT },
          issuetype: { name: "Task" },
          summary,
          description: description(tc),
          labels: [slug(tc.area), typeLabel[tc.type] || slug(tc.type)],
        },
      }),
    });
    console.log(`CREATE ${issue.key}  ${summary}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${testCases.length} total.`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
