import { renderToHtml } from "@/services/Markdown";

describe("Markdown Service", () => {
  describe("renderToHtml", () => {
    it("renders basic markdown to HTML", () => {
      const result = renderToHtml("**bold text**");
      expect(result).toContain("<strong>bold text</strong>");
    });

    it("renders headings", () => {
      const result = renderToHtml("# Heading 1");
      expect(result).toContain("<h1");
      expect(result).toContain("Heading 1");
    });

    it("renders links", () => {
      const result = renderToHtml("[link](https://example.com)");
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain("link</a>");
    });

    it("renders unordered lists", () => {
      const result = renderToHtml("- item 1\n- item 2");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>item 1</li>");
      expect(result).toContain("<li>item 2</li>");
    });

    it("renders ordered lists", () => {
      const result = renderToHtml("1. first\n2. second");
      expect(result).toContain("<ol>");
      expect(result).toContain("<li>first</li>");
    });

    it("renders paragraphs", () => {
      const result = renderToHtml("Hello world");
      expect(result).toContain("<p>Hello world</p>");
    });

    it("returns empty string for null input", () => {
      expect(renderToHtml(null)).toBe("");
    });

    it("returns empty string for undefined input", () => {
      expect(renderToHtml(undefined)).toBe("");
    });

    it("returns empty string for empty string input", () => {
      expect(renderToHtml("")).toBe("");
    });
  });

  describe("XSS sanitization", () => {
    it("strips script tags from markdown content", () => {
      const result = renderToHtml('<script>alert("xss")</script>');
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
    });

    it("strips onclick handlers", () => {
      const result = renderToHtml('<div onclick="alert(1)">click</div>');
      expect(result).not.toContain("onclick");
    });

    it("strips onerror handlers from images", () => {
      const result = renderToHtml('<img src="x" onerror="alert(1)">');
      expect(result).not.toContain("onerror");
    });

    it("strips javascript: URLs from links", () => {
      const result = renderToHtml('<a href="javascript:alert(1)">click</a>');
      expect(result).not.toContain("javascript:");
    });

    it("strips iframe tags", () => {
      const result = renderToHtml('<iframe src="https://evil.com"></iframe>');
      expect(result).not.toContain("<iframe");
    });

    it("preserves safe HTML elements", () => {
      const result = renderToHtml("<strong>bold</strong>");
      expect(result).toContain("<strong>bold</strong>");
    });

    it("preserves safe links", () => {
      const result = renderToHtml(
        '<a href="https://example.com">safe link</a>'
      );
      expect(result).toContain("https://example.com");
      expect(result).toContain("safe link");
    });

    it("strips style tags", () => {
      const result = renderToHtml("<style>body { display: none; }</style>");
      expect(result).not.toContain("<style>");
    });

    it("strips data attributes used for XSS", () => {
      const result = renderToHtml(
        '<div data-xss="test" onmouseover="alert(1)">content</div>'
      );
      expect(result).not.toContain("onmouseover");
    });
  });
});
