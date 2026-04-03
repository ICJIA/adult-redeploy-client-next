import puppeteer from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";

const BASE = "http://localhost:8080";

// All static routes from router.js
// Dynamic routes (:slug, :section, :category) will be discovered by crawling links
const STATIC_ROUTES = [
  "/",
  "/programs",
  "/sites",
  "/news",
  "/apps",
  "/about/oversight",
  "/about/staff",
  "/about/meetings",
  "/resources",
  "/search",
];

async function discoverLinks(page, url) {
  const links = await page.evaluate((base) => {
    return [...document.querySelectorAll("a[href]")]
      .map((a) => {
        try {
          const u = new URL(a.href, base);
          if (u.origin === new URL(base).origin) return u.pathname;
        } catch {}
        return null;
      })
      .filter(Boolean);
  }, BASE);
  return [...new Set(links)];
}

async function auditPage(browser, path, results) {
  const url = `${BASE}${path}`;
  const page = await browser.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    // Wait a bit for Vue to render
    await new Promise((r) => setTimeout(r, 2000));

    const axeResults = await new AxePuppeteer(page).analyze();

    const violations = axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(" > ")),
    }));

    results.push({
      path,
      url,
      violationCount: violations.length,
      totalNodes: violations.reduce((sum, v) => sum + v.nodes, 0),
      violations,
    });

    console.log(
      `  ${path} — ${violations.length} violations (${violations.reduce((s, v) => s + v.nodes, 0)} elements)`
    );

    // Discover links for crawling
    const links = await discoverLinks(page, url);
    return links;
  } catch (e) {
    console.log(`  ${path} — ERROR: ${e.message}`);
    results.push({ path, url, error: e.message });
    return [];
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("Starting axe-core accessibility audit...\n");
  console.log(`Base URL: ${BASE}\n`);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];
  const visited = new Set();
  const toVisit = [...STATIC_ROUTES];

  // Patterns to skip
  const skipPatterns = [/\/sandbox/, /\/error/, /\/home$/, /\/applications/];

  while (toVisit.length > 0) {
    const path = toVisit.shift();
    const normalizedPath = path.replace(/\/$/, "") || "/";

    if (visited.has(normalizedPath)) continue;
    if (skipPatterns.some((p) => p.test(normalizedPath))) continue;

    visited.add(normalizedPath);
    console.log(`Auditing: ${normalizedPath}`);

    const discoveredLinks = await auditPage(browser, normalizedPath, results);

    // Add newly discovered internal links
    for (const link of discoveredLinks) {
      const norm = link.replace(/\/$/, "") || "/";
      if (
        !visited.has(norm) &&
        !toVisit.includes(norm) &&
        !skipPatterns.some((p) => p.test(norm)) &&
        !norm.startsWith("/api") &&
        !norm.includes("#")
      ) {
        toVisit.push(norm);
      }
    }
  }

  await browser.close();

  // Generate summary
  console.log("\n" + "=".repeat(80));
  console.log("ACCESSIBILITY AUDIT SUMMARY");
  console.log("=".repeat(80));
  console.log(`Pages audited: ${results.filter((r) => !r.error).length}`);
  console.log(`Pages with errors: ${results.filter((r) => r.error).length}`);

  const totalViolations = results.reduce((s, r) => s + (r.violationCount || 0), 0);
  const totalNodes = results.reduce((s, r) => s + (r.totalNodes || 0), 0);
  console.log(`Total unique violations: ${totalViolations}`);
  console.log(`Total affected elements: ${totalNodes}`);

  // Aggregate violations across all pages
  const violationMap = {};
  for (const r of results) {
    if (!r.violations) continue;
    for (const v of r.violations) {
      if (!violationMap[v.id]) {
        violationMap[v.id] = {
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          pageCount: 0,
          totalNodes: 0,
          pages: [],
        };
      }
      violationMap[v.id].pageCount++;
      violationMap[v.id].totalNodes += v.nodes;
      violationMap[v.id].pages.push({ path: r.path, nodes: v.nodes, targets: v.targets });
    }
  }

  // Sort by impact severity
  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const sortedViolations = Object.values(violationMap).sort(
    (a, b) => (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4)
  );

  console.log("\n" + "-".repeat(80));
  console.log("VIOLATIONS BY SEVERITY");
  console.log("-".repeat(80));

  for (const v of sortedViolations) {
    console.log(
      `\n[${(v.impact || "unknown").toUpperCase()}] ${v.id} — ${v.help}`
    );
    console.log(`  Description: ${v.description}`);
    console.log(`  Affected: ${v.pageCount} page(s), ${v.totalNodes} element(s)`);
    console.log(`  Help: ${v.helpUrl}`);
    console.log(`  Pages:`);
    for (const p of v.pages) {
      console.log(`    - ${p.path} (${p.nodes} elements)`);
      if (p.targets.length) {
        for (const t of p.targets) {
          console.log(`      → ${t}`);
        }
      }
    }
  }

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    summary: {
      pagesAudited: results.filter((r) => !r.error).length,
      pagesWithErrors: results.filter((r) => r.error).length,
      totalUniqueViolations: sortedViolations.length,
      totalAffectedElements: totalNodes,
    },
    violationsByRule: sortedViolations,
    pageResults: results,
  };

  const fs = await import("fs");
  fs.writeFileSync("axe-audit-report.json", JSON.stringify(report, null, 2));
  console.log("\n\nFull report saved to: axe-audit-report.json");
}

main().catch((e) => {
  console.error("Audit failed:", e);
  process.exit(1);
});
