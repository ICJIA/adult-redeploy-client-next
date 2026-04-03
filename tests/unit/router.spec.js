/**
 * Router configuration tests
 *
 * Tests route definitions by reading the source file directly,
 * avoiding babel/vue-cli conflicts with CommonJS require.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const routerSource = readFileSync(
  resolve(__dirname, "../../src/router.js"),
  "utf-8"
);

describe("Router Configuration", () => {
  it("uses history mode", () => {
    expect(routerSource).toContain('mode: "history"');
  });

  it("has scrollBehavior that returns x:0, y:0", () => {
    expect(routerSource).toContain("return { x: 0, y: 0 }");
  });

  describe("route definitions", () => {
    it("defines home route at /", () => {
      expect(routerSource).toMatch(/path:\s*"\/"\s*,\s*\n\s*name:\s*"home"/);
    });

    it("defines programs route", () => {
      expect(routerSource).toContain('path: "/programs"');
      expect(routerSource).toContain('name: "programs"');
    });

    it("defines sites list route", () => {
      expect(routerSource).toContain('path: "/sites"');
      expect(routerSource).toContain('name: "siteDescriptions"');
    });

    it("defines site detail route with slug param", () => {
      expect(routerSource).toContain('path: "/sites/:slug"');
      expect(routerSource).toContain('name: "siteDescriptionSingle"');
    });

    it("defines news single route", () => {
      expect(routerSource).toContain('path: "/news/:slug"');
      expect(routerSource).toContain('name: "newsSingle"');
    });

    it("defines news list route", () => {
      expect(routerSource).toContain('path: "/news"');
      expect(routerSource).toContain('name: "news"');
    });

    it("defines apps route", () => {
      expect(routerSource).toContain('path: "/apps"');
      expect(routerSource).toContain('name: "apps"');
    });

    it("redirects /applications to apps", () => {
      expect(routerSource).toContain('path: "/applications"');
      expect(routerSource).toContain('redirect: "apps"');
    });

    it("defines oversight board route", () => {
      expect(routerSource).toContain('path: "/about/oversight"');
      expect(routerSource).toContain('name: "oversightBoard"');
    });

    it("defines staff route", () => {
      expect(routerSource).toContain('path: "/about/staff"');
      expect(routerSource).toContain('name: "stafff"');
    });

    it("defines biography detail route", () => {
      expect(routerSource).toContain('path: "/about/biographies/:slug"');
      expect(routerSource).toContain('name: "biographiesSingle"');
    });

    it("defines meetings list route", () => {
      expect(routerSource).toContain('path: "/about/meetings"');
      expect(routerSource).toContain('name: "meetings"');
    });

    it("defines meetings by category route", () => {
      expect(routerSource).toContain('path: "/about/meetings/:category"');
      expect(routerSource).toContain('name: "meetingsByCategory"');
    });

    it("defines meetings single route", () => {
      expect(routerSource).toContain('path: "/about/meetings/:category/:slug"');
      expect(routerSource).toContain('name: "meetingsSingle"');
    });

    it("defines resources list route", () => {
      expect(routerSource).toContain('path: "/resources"');
      expect(routerSource).toContain('name: "resources"');
    });

    it("defines resources by category route", () => {
      expect(routerSource).toContain('path: "/resources/:category"');
      expect(routerSource).toContain('name: "resourcesByCategory"');
    });

    it("defines resources single route", () => {
      expect(routerSource).toContain('path: "/resources/:category/:slug"');
      expect(routerSource).toContain('name: "resourcesSingle"');
    });

    it("defines tags route", () => {
      expect(routerSource).toContain('path: "/tags/:slug"');
      expect(routerSource).toContain('name: "tagsSingle"');
    });

    it("defines search route", () => {
      expect(routerSource).toContain('path: "/search"');
      expect(routerSource).toContain('name: "search"');
    });

    it("defines error route", () => {
      expect(routerSource).toContain('path: "/error"');
      expect(routerSource).toContain('name: "error"');
    });

    it("defines dynamic section route", () => {
      expect(routerSource).toContain('path: "/:section"');
      expect(routerSource).toContain('name: "section"');
    });

    it("defines dynamic page route", () => {
      expect(routerSource).toContain('path: "/:section/:slug"');
      expect(routerSource).toContain('name: "page"');
    });

    it("defines catch-all redirect route", () => {
      expect(routerSource).toContain('path: "*"');
      expect(routerSource).toContain('name: "redirect"');
    });

    it("home route hides breadcrumb", () => {
      expect(routerSource).toContain("hideBreadcrumb: true");
    });
  });

  describe("route afterEach hook", () => {
    it("stores previous route in localStorage", () => {
      expect(routerSource).toContain("localStorage.setItem(LS_ROUTE_KEY");
      expect(routerSource).toContain("from.path");
    });
  });

  describe("lazy loading", () => {
    it("uses webpack chunk names for code splitting", () => {
      expect(routerSource).toContain("webpackChunkName");
      // Check several key chunks exist
      expect(routerSource).toContain('"programs"');
      expect(routerSource).toContain('"sites"');
      expect(routerSource).toContain('"news"');
      expect(routerSource).toContain('"biographies"');
      expect(routerSource).toContain('"meetings"');
      expect(routerSource).toContain('"resources"');
    });
  });
});
