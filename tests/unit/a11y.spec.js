/**
 * Accessibility regression tests
 *
 * Ensures a11y fixes remain in place by checking component output
 * for proper ARIA attributes, heading structure, and contrast-related classes.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

function readComponent(relativePath) {
  return readFileSync(resolve(__dirname, "../../src", relativePath), "utf-8");
}

describe("Accessibility - Skip link", () => {
  it("App.vue has a skip-to-main-content link as first focusable element", () => {
    const source = readFileSync(resolve(__dirname, "../../src/App.vue"), "utf-8");
    expect(source).toContain('class="skip-link"');
    expect(source).toContain('href="#content-top"');
    expect(source).toContain("Skip to main content");
  });

  it("App.vue content area has tabindex for skip link target", () => {
    const source = readFileSync(resolve(__dirname, "../../src/App.vue"), "utf-8");
    expect(source).toMatch(/id="content-top"[^>]*tabindex="-1"/);
  });

  it("App.vue content area has role=main", () => {
    const source = readFileSync(resolve(__dirname, "../../src/App.vue"), "utf-8");
    expect(source).toMatch(/id="content-top"[^>]*role="main"/);
  });

  it("app.css has skip-link styles", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/css/app.css"),
      "utf-8"
    );
    expect(css).toContain(".skip-link");
    expect(css).toContain(".skip-link:focus");
  });
});

describe("Accessibility - ARIA labels", () => {
  it("AppNav hamburger has aria-label", () => {
    const source = readComponent("components/AppNav.vue");
    expect(source).toContain('aria-label="Open navigation menu"');
  });

  it("AppNav search button has aria-label", () => {
    const source = readComponent("components/AppNav.vue");
    expect(source).toContain('aria-label="Search"');
  });

  it("ListTableResource download button has aria-label", () => {
    const source = readComponent("components/ListTableResource.vue");
    expect(source).toMatch(/aria-label.*Download/);
  });

  it("ListTableResource external link button has aria-label", () => {
    const source = readComponent("components/ListTableResource.vue");
    expect(source).toMatch(/aria-label.*Go to/);
  });

  it("ListTableResource simple table button has aria-label", () => {
    const source = readComponent("components/ListTableResource.vue");
    expect(source).toMatch(/aria-label.*View/);
  });

  it("ListTableMeeting link button has aria-label", () => {
    const source = readComponent("components/ListTableMeeting.vue");
    expect(source).toMatch(/aria-label.*View/);
  });

  it("ListTableNews link button has aria-label", () => {
    const source = readComponent("components/ListTableNews.vue");
    expect(source).toMatch(/aria-label.*View/);
  });

  it("HomeArticles pagination has aria-label", () => {
    const source = readComponent("components/HomeArticles.vue");
    expect(source).toContain('aria-label="Publications pagination"');
  });

  it("HomeArticles pagination has previous/next aria-labels", () => {
    const source = readComponent("components/HomeArticles.vue");
    expect(source).toContain('previous-aria-label="Previous page"');
    expect(source).toContain('next-aria-label="Next page"');
  });
});

describe("Accessibility - Heading structure", () => {
  it("Home.vue uses h2 elements instead of spans for section headers", () => {
    const source = readComponent("views/Home.vue");
    // Should have h2 for section headings, not span
    expect(source).toContain("<h2");
    expect(source).not.toMatch(
      /<span[^>]*class="news-title[^"]*"[^>]*>.*ABOUT ADULT REDEPLOY/s
    );
  });

  it("HomeCarousel.vue has h1 for main heading", () => {
    const source = readComponent("components/HomeCarousel.vue");
    expect(source).toContain("<h1");
    expect(source).toContain("Adult Redeploy Illinois");
  });

  it("BiographiesSingle.vue has h1 via title slot", () => {
    const source = readComponent("views/BiographiesSingle.vue");
    expect(source).toContain("v-slot:title");
    expect(source).toContain('<h1 class="page-title"');
  });

  it("NewsSingle.vue has h1 via title slot", () => {
    const source = readComponent("views/NewsSingle.vue");
    expect(source).toContain("v-slot:title");
    expect(source).toContain('<h1 class="page-title"');
  });

  it("Search.vue has h1 heading", () => {
    const source = readComponent("views/Search.vue");
    expect(source).toContain('<h1 class="page-title">Search</h1>');
  });
});

describe("Accessibility - Color contrast", () => {
  it("HomeArticles card-banner has sufficient opacity overlay", () => {
    const source = readComponent("components/HomeArticles.vue");
    // Should be at least 0.7 opacity for white text contrast
    expect(source).toMatch(
      /\.card-banner\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.7\)/
    );
  });

  it("Apps.vue card-banner has sufficient opacity overlay", () => {
    const source = readComponent("views/Apps.vue");
    expect(source).toMatch(
      /\.card-banner\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.7\)/
    );
  });

  it("HomeCarousel FAQs button is not outlined (sufficient contrast)", () => {
    const source = readComponent("components/HomeCarousel.vue");
    // The FAQs button should NOT have outlined prop
    expect(source).not.toMatch(/to="\/about\/faqs"[^>]*outlined/);
  });
});

describe("Accessibility - Inline spacing", () => {
  it("app.css has dynamic-content override for inline spacing", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/css/app.css"),
      "utf-8"
    );
    expect(css).toContain(".dynamic-content *");
    expect(css).toContain("line-height: inherit !important");
    expect(css).toContain("letter-spacing: inherit !important");
    expect(css).toContain("word-spacing: inherit !important");
  });

  it("BiographyCard does not use !important on line-height", () => {
    const source = readComponent("components/BiographyCard.vue");
    expect(source).not.toContain("line-height: 20px !important");
    // Should use relative unit instead
    expect(source).toContain("line-height: 1.4em");
  });
});
