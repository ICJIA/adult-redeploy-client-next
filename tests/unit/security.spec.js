/**
 * Security regression tests
 *
 * Ensures security mitigations remain in place.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

function readFile(relativePath) {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("Security - Content Security Policy", () => {
  it("netlify.toml contains security headers", () => {
    const toml = readFile("netlify.toml");
    expect(toml).toContain("X-Frame-Options");
    expect(toml).toContain("X-Content-Type-Options");
    expect(toml).toContain("Referrer-Policy");
    expect(toml).toContain("Content-Security-Policy");
  });

  it("CSP includes X-Frame-Options SAMEORIGIN", () => {
    const toml = readFile("netlify.toml");
    expect(toml).toContain('X-Frame-Options = "SAMEORIGIN"');
  });

  it("CSP includes nosniff", () => {
    const toml = readFile("netlify.toml");
    expect(toml).toContain('X-Content-Type-Options = "nosniff"');
  });

  it("CSP restricts frame-ancestors", () => {
    const toml = readFile("netlify.toml");
    expect(toml).toContain("frame-ancestors 'self'");
  });

  it("CSP includes Permissions-Policy", () => {
    const toml = readFile("netlify.toml");
    expect(toml).toContain("Permissions-Policy");
    expect(toml).toContain("camera=()");
    expect(toml).toContain("microphone=()");
  });
});

describe("Security - XSS prevention", () => {
  it("Markdown service imports xss library", () => {
    const source = readFile("src/services/Markdown.js");
    expect(source).toContain('require("xss")');
  });

  it("Markdown renderToHtml sanitizes output", () => {
    const source = readFile("src/services/Markdown.js");
    // xss() should be called on the rendered markdown
    expect(source).toMatch(/xss\(raw/);
  });

  it("Content service uses xss on slug parameters", () => {
    const source = readFile("src/services/Content.js");
    expect(source).toContain("xss(slug)");
  });
});

describe("Security - External scripts", () => {
  it("index.html does not load jQuery", () => {
    const html = readFile("public/index.html");
    expect(html).not.toContain("jquery");
  });

  it("index.html loads Plausible analytics", () => {
    const html = readFile("public/index.html");
    expect(html).toContain("plausible.icjia.cloud");
  });
});

describe("Security - Sensitive data", () => {
  it(".gitignore includes .env files", () => {
    const gitignore = readFile(".gitignore");
    expect(gitignore).toContain(".env");
  });

  it("store.js does not read jwt from localStorage", () => {
    const source = readFile("src/store.js");
    expect(source).not.toContain('localStorage.getItem("jwt")');
  });

  it("store.js does not read userMeta from localStorage", () => {
    const source = readFile("src/store.js");
    expect(source).not.toContain('localStorage.getItem("userMeta")');
  });

  it("no hardcoded API keys in source files", () => {
    const content = readFile("src/services/Content.js");
    // Should use environment variables, not hardcoded keys
    expect(content).not.toMatch(/apiKey\s*[:=]\s*["'][a-zA-Z0-9]{10,}/);
  });
});

describe("Security - Download service", () => {
  it("uses noopener and noreferrer for window.open", () => {
    const source = readFile("src/services/Download.js");
    expect(source).toContain("noreferrer");
    expect(source).toContain("noopener");
  });
});
