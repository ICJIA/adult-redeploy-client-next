/**
 * Component structure tests
 *
 * Validates component templates and props by reading source files directly.
 * This avoids the babel-core 6.x / @vue/cli-plugin-babel 4.x conflict
 * that prevents .vue file imports in the test environment.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

function readComponent(name) {
  return readFileSync(
    resolve(__dirname, "../../src/components", name),
    "utf-8"
  );
}

function readView(name) {
  return readFileSync(resolve(__dirname, "../../src/views", name), "utf-8");
}

describe("AppNav.vue", () => {
  let source;
  beforeAll(() => {
    source = readComponent("AppNav.vue");
  });

  it("has v-app-bar-nav-icon for mobile menu", () => {
    expect(source).toContain("v-app-bar-nav-icon");
  });

  it("has toggleDrawer method", () => {
    expect(source).toContain("toggleDrawer");
  });

  it("accepts sections as a prop", () => {
    expect(source).toMatch(/sections:\s*\{/);
    expect(source).toContain("type: Array");
  });

  it("has logoWidth method for responsive logo", () => {
    expect(source).toContain("logoWidth()");
  });

  it("renders navigation items from sections prop", () => {
    expect(source).toContain('v-for="link in sections"');
  });

  it("has submenu support for sections with pages", () => {
    expect(source).toContain("link.hasSubMenus");
    expect(source).toContain("link.pages.length");
  });

  it("renders dropdown arrow for sections with submenus", () => {
    expect(source).toContain("arrow_drop_down");
  });

  it("has ICJIA logo with alt text", () => {
    expect(source).toContain(
      'alt="Illinois Criminal Justice Information Authority"'
    );
  });
});

describe("BiographyCard.vue", () => {
  let source;
  beforeAll(() => {
    source = readComponent("BiographyCard.vue");
  });

  it("renders person name with prefix, first, middle, last, suffix", () => {
    expect(source).toContain("person.prefix");
    expect(source).toContain("person.firstName");
    expect(source).toContain("person.middleName");
    expect(source).toContain("person.lastName");
    expect(source).toContain("person.suffix");
  });

  it("links to biography detail page", () => {
    expect(source).toContain("/about/biographies/${person.slug}");
  });

  it("renders person title", () => {
    expect(source).toContain("person.title");
  });

  it("renders dynamic content from markdown", () => {
    expect(source).toContain("renderToHtml(person.content)");
  });

  it("accepts person as a prop", () => {
    expect(source).toMatch(/person:\s*\{/);
    expect(source).toContain("type: Object");
  });

  it("accepts displayCategory as a prop", () => {
    expect(source).toMatch(/displayCategory:\s*\{/);
    expect(source).toContain("type: Boolean");
  });

  it("shows oversight board link when category is board", () => {
    expect(source).toContain("person.category === 'board'");
    expect(source).toContain("OVERSIGHT BOARD");
  });

  it("shows staff link when category is not board", () => {
    expect(source).toContain("STAFF");
  });

  it("renders tags via TagList component", () => {
    expect(source).toContain("TagList");
    expect(source).toContain(':tags="person.tags"');
  });

  it("uses handleClicks mixin for link handling", () => {
    expect(source).toContain("handleClicks");
  });
});

describe("NewsCard.vue", () => {
  let source;
  beforeAll(() => {
    source = readComponent("NewsCard.vue");
  });

  it("renders title as h2 element", () => {
    expect(source).toMatch(/<h2[\s\S]*?class="headline/);
  });

  it("renders title as a router-link to news detail", () => {
    expect(source).toContain("/news/${content.slug}");
  });

  it("renders posted date component", () => {
    expect(source).toContain("PostedDate");
  });

  it("renders content via readmore or dynamic-content", () => {
    expect(source).toContain("readmore");
    expect(source).toContain("dynamic-content");
  });

  it("accepts content as a prop", () => {
    expect(source).toMatch(/content:\s*\{/);
    expect(source).toContain("type: Object");
  });

  it("accepts readMore as a boolean prop defaulting to true", () => {
    expect(source).toMatch(/readMore:\s*\{/);
    expect(source).toContain("default: true");
  });

  it("accepts elevation as a boolean prop", () => {
    expect(source).toMatch(/elevation:\s*\{/);
  });

  it("shows news link when displayNewsLink is true", () => {
    expect(source).toContain("displayNewsLink");
    expect(source).toContain("Adult Redeploy Illinois News");
  });

  it("shows updated date when publication and update dates differ", () => {
    expect(source).toContain("displayUpdated");
    expect(source).toContain("Last updated");
  });
});

describe("BaseContent.vue", () => {
  let source;
  beforeAll(() => {
    source = readComponent("BaseContent.vue");
  });

  it("has title slot", () => {
    expect(source).toContain('name="title"');
  });

  it("has content slot", () => {
    expect(source).toContain('name="content"');
  });

  it("has printer slot", () => {
    expect(source).toContain('name="printer"');
  });

  it("shows loader when loading is true", () => {
    expect(source).toContain("v-else");
    expect(source).toContain("loader");
  });

  it("accepts loading as a prop defaulting to true", () => {
    expect(source).toMatch(/loading:\s*\{/);
    expect(source).toContain("default: true");
  });
});

describe("HomeCarousel.vue", () => {
  let source;
  beforeAll(() => {
    source = readComponent("HomeCarousel.vue");
  });

  it("has h1 heading", () => {
    expect(source).toContain("<h1");
    expect(source).toContain("Adult Redeploy Illinois");
  });

  it("has Learn More button", () => {
    expect(source).toContain("Learn More");
  });

  it("has FAQs button", () => {
    expect(source).toContain("FAQs");
    expect(source).toContain("/about/faqs");
  });

  it("has banner with background overlay", () => {
    expect(source).toContain(".banner");
    expect(source).toContain("background: rgba");
  });
});

describe("HomeArticles.vue", () => {
  let source;
  beforeAll(() => {
    source = readComponent("HomeArticles.vue");
  });

  it("renders pagination component", () => {
    expect(source).toContain("v-pagination");
  });

  it("renders article cards", () => {
    expect(source).toContain('v-for="article in articles"');
  });

  it("links to Research Hub", () => {
    expect(source).toContain("icjia.illinois.gov/researchhub");
  });

  it("handles loading state with skeleton loaders", () => {
    expect(source).toContain("VSkeletonLoader");
  });

  it("handles error state", () => {
    expect(source).toContain("error.status");
    expect(source).toContain("error.msg");
  });
});

describe("View pages", () => {
  it("Home.vue includes all required home components", () => {
    const source = readView("Home.vue");
    expect(source).toContain("HomeCarousel");
    expect(source).toContain("HomeBoxes");
    expect(source).toContain("HomeNews");
    expect(source).toContain("HomeAbout");
    expect(source).toContain("HomeArticles");
    expect(source).toContain("HomeMeetings");
  });

  it("Apps.vue has h1 page title", () => {
    const source = readView("Apps.vue");
    expect(source).toContain('<h1 class="page-title">');
  });

  it("Search.vue has h1 page title", () => {
    const source = readView("Search.vue");
    expect(source).toContain('<h1 class="page-title">Search</h1>');
  });

  it("BiographiesSingle.vue has h1 via title slot", () => {
    const source = readView("BiographiesSingle.vue");
    expect(source).toContain("v-slot:title");
    expect(source).toContain('<h1 class="page-title"');
  });

  it("NewsSingle.vue has h1 via title slot", () => {
    const source = readView("NewsSingle.vue");
    expect(source).toContain("v-slot:title");
    expect(source).toContain('<h1 class="page-title"');
  });
});
