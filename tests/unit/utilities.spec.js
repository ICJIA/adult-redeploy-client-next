import {
  getHash,
  titleCase,
  getSectionContent,
  checkIfValidPage,
  stripHTML,
  truncate,
  strapiEnumToObject,
  strapiSlugToObject,
  dateFormat,
} from "@/services/Utilities";

describe("Utilities", () => {
  describe("getHash", () => {
    it("returns a consistent MD5 hash for a given string", () => {
      const hash1 = getHash("test-string");
      const hash2 = getHash("test-string");
      expect(hash1).toBe(hash2);
    });

    it("returns different hashes for different strings", () => {
      const hash1 = getHash("string-a");
      const hash2 = getHash("string-b");
      expect(hash1).not.toBe(hash2);
    });

    it("returns a 32-character hex string", () => {
      const hash = getHash("anything");
      expect(hash).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  describe("titleCase", () => {
    it("converts a lowercase string to title case", () => {
      expect(titleCase("hello world")).toBe("Hello World");
    });

    it("handles single word", () => {
      expect(titleCase("hello")).toBe("Hello");
    });

    it("converts uppercase to title case", () => {
      expect(titleCase("HELLO WORLD")).toBe("Hello World");
    });

    it("returns undefined for falsy input", () => {
      expect(titleCase("")).toBeUndefined();
      expect(titleCase(null)).toBeUndefined();
    });
  });

  describe("getSectionContent", () => {
    const sections = [
      { slug: "about", title: "About" },
      { slug: "news", title: "News" },
      { slug: "search", title: "Search" },
    ];

    it("returns matching section by slug", () => {
      const result = getSectionContent(sections, "news");
      expect(result).toEqual([{ slug: "news", title: "News" }]);
    });

    it("returns empty array for non-existent slug", () => {
      const result = getSectionContent(sections, "nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("checkIfValidPage", () => {
    it("returns true for non-empty array", () => {
      expect(checkIfValidPage([{ id: 1 }])).toBeTruthy();
    });

    it("returns false for empty array", () => {
      expect(checkIfValidPage([])).toBeFalsy();
    });

    it("returns 0 for null", () => {
      expect(checkIfValidPage(null)).toBe(0);
    });

    it("returns 0 for undefined", () => {
      expect(checkIfValidPage(undefined)).toBe(0);
    });
  });

  describe("stripHTML", () => {
    it("removes HTML tags from string", () => {
      expect(stripHTML("<p>Hello <strong>World</strong></p>")).toBe(
        "Hello World"
      );
    });

    it("handles string without HTML", () => {
      expect(stripHTML("plain text")).toBe("plain text");
    });

    it("returns undefined for falsy input", () => {
      expect(stripHTML("")).toBeUndefined();
      expect(stripHTML(null)).toBeUndefined();
    });
  });

  describe("truncate", () => {
    it("truncates to specified word count with ellipsis", () => {
      const result = truncate("one two three four five six", 3);
      expect(result).toBe("one two three...");
    });

    it("does not add ellipsis if under limit", () => {
      const result = truncate("one two", 5);
      expect(result).toBe("one two");
    });

    it("uses default maxWords of 10", () => {
      const words = "a b c d e f g h i j k l".split(" ");
      const result = truncate(words.join(" "));
      expect(result).toBe("a b c d e f g h i j...");
    });

    it("returns undefined for falsy input", () => {
      expect(truncate("")).toBeUndefined();
    });
  });

  describe("strapiEnumToObject", () => {
    it("returns matching enum object for resources", () => {
      const result = strapiEnumToObject("resources", "annualReport");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].enum).toBe("annualReport");
    });

    it("returns empty array for non-existent enum", () => {
      const result = strapiEnumToObject("resources", "nonexistent_enum");
      expect(result).toEqual([]);
    });
  });

  describe("strapiSlugToObject", () => {
    it("returns matching slug object for meetings", () => {
      const result = strapiSlugToObject("meetings", "regular-oversight");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].slug).toBe("regular-oversight");
    });

    it("returns empty array for non-existent slug", () => {
      const result = strapiSlugToObject("meetings", "nonexistent-slug");
      expect(result).toEqual([]);
    });
  });

  describe("dateFormat", () => {
    it("formats a date string correctly", () => {
      const result = dateFormat("2026-01-15");
      expect(result).toBe("January 15, 2026");
    });

    it("formats ISO date string", () => {
      const result = dateFormat("2026-12-25T00:00:00.000Z");
      expect(result).toMatch(/December 25, 2026/);
    });
  });
});
