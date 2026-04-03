import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// Recreate the store for testing without localStorage dependencies
function createStore() {
  return new Vuex.Store({
    state: {
      isAppReady: false,
      config: null,
      routes: null,
      sections: null,
      appCount: null,
      articleCount: null,
      searchIndex: null,
      apiStatus: null,
      cache: new Map(),
      selectedCountyData: null,
      jwt: "",
      userMeta: "",
    },
    mutations: {
      CLEAR_CACHE(state) {
        state.cache.clear();
      },
      SET_APP_READY(state, bool) {
        state.isAppReady = bool;
      },
      SET_CONFIG(state, config) {
        state.config = config;
      },
      SET_ROUTES(state, routes) {
        state.routes = routes;
      },
      SET_SEARCH_INDEX(state, searchIndex) {
        state.searchIndex = searchIndex;
      },
      SET_CACHE(state, { hash, query }) {
        state.cache.set(hash, query);
      },
      SET_SECTIONS(state, sections) {
        state.sections = sections;
      },
      SET_APP_COUNT(state, appCount) {
        state.appCount = appCount;
      },
      SET_ARTICLE_COUNT(state, articleCount) {
        state.articleCount = articleCount;
      },
      SET_API_STATUS(state, apiStatus) {
        state.apiStatus = apiStatus;
      },
      SET_SELECTED_COUNTY_DATA(state, payload) {
        state.selectedCountyData = payload;
      },
    },
    getters: {
      inCache: (state) => (hash) => {
        return state.cache.has(hash);
      },
      isApiReady: (state) => {
        return state.apiStatus === 200 || state.apiStatus === 204;
      },
      config: (state) => state.config,
      selectedCountyData: (state) => state.selectedCountyData,
      sections: (state) => state.sections,
      appCount: (state) => state.appCount,
      articleCount: (state) => state.articleCount,
      getContentFromCache: (state) => (map, key) => {
        if (map.get(key)) {
          return state.cache.get(map.get(key).hash);
        }
        return [];
      },
    },
  });
}

describe("Vuex Store", () => {
  let store;

  beforeEach(() => {
    store = createStore();
  });

  describe("initial state", () => {
    it("starts with isAppReady as false", () => {
      expect(store.state.isAppReady).toBe(false);
    });

    it("starts with null config", () => {
      expect(store.state.config).toBeNull();
    });

    it("starts with empty cache", () => {
      expect(store.state.cache.size).toBe(0);
    });

    it("starts with null apiStatus", () => {
      expect(store.state.apiStatus).toBeNull();
    });
  });

  describe("mutations", () => {
    it("SET_APP_READY sets isAppReady", () => {
      store.commit("SET_APP_READY", true);
      expect(store.state.isAppReady).toBe(true);
    });

    it("SET_CONFIG sets config object", () => {
      const config = { baseURL: "https://test.com" };
      store.commit("SET_CONFIG", config);
      expect(store.state.config).toEqual(config);
    });

    it("SET_SECTIONS sets sections array", () => {
      const sections = [{ slug: "about" }, { slug: "news" }];
      store.commit("SET_SECTIONS", sections);
      expect(store.state.sections).toEqual(sections);
    });

    it("SET_CACHE adds entry to cache Map", () => {
      store.commit("SET_CACHE", { hash: "abc123", query: { data: "test" } });
      expect(store.state.cache.has("abc123")).toBe(true);
      expect(store.state.cache.get("abc123")).toEqual({ data: "test" });
    });

    it("CLEAR_CACHE empties the cache", () => {
      store.commit("SET_CACHE", { hash: "abc", query: "data" });
      store.commit("SET_CACHE", { hash: "def", query: "data2" });
      expect(store.state.cache.size).toBe(2);
      store.commit("CLEAR_CACHE");
      expect(store.state.cache.size).toBe(0);
    });

    it("SET_APP_COUNT sets appCount", () => {
      store.commit("SET_APP_COUNT", 5);
      expect(store.state.appCount).toBe(5);
    });

    it("SET_ARTICLE_COUNT sets articleCount", () => {
      store.commit("SET_ARTICLE_COUNT", 42);
      expect(store.state.articleCount).toBe(42);
    });

    it("SET_API_STATUS sets apiStatus", () => {
      store.commit("SET_API_STATUS", 200);
      expect(store.state.apiStatus).toBe(200);
    });

    it("SET_SELECTED_COUNTY_DATA sets county data", () => {
      const data = { county: "Cook", population: 5000000 };
      store.commit("SET_SELECTED_COUNTY_DATA", data);
      expect(store.state.selectedCountyData).toEqual(data);
    });

    it("SET_SEARCH_INDEX sets search index", () => {
      const index = [{ title: "Page 1" }];
      store.commit("SET_SEARCH_INDEX", index);
      expect(store.state.searchIndex).toEqual(index);
    });
  });

  describe("getters", () => {
    it("inCache returns true for cached hash", () => {
      store.commit("SET_CACHE", { hash: "test-hash", query: "data" });
      expect(store.getters.inCache("test-hash")).toBe(true);
    });

    it("inCache returns false for uncached hash", () => {
      expect(store.getters.inCache("nonexistent")).toBe(false);
    });

    it("isApiReady returns true for status 200", () => {
      store.commit("SET_API_STATUS", 200);
      expect(store.getters.isApiReady).toBe(true);
    });

    it("isApiReady returns true for status 204", () => {
      store.commit("SET_API_STATUS", 204);
      expect(store.getters.isApiReady).toBe(true);
    });

    it("isApiReady returns false for status 500", () => {
      store.commit("SET_API_STATUS", 500);
      expect(store.getters.isApiReady).toBe(false);
    });

    it("isApiReady returns false for null status", () => {
      expect(store.getters.isApiReady).toBe(false);
    });

    it("getContentFromCache returns cached content", () => {
      store.commit("SET_CACHE", { hash: "h1", query: [{ title: "Page" }] });
      const map = new Map();
      map.set("key1", { hash: "h1" });
      expect(store.getters.getContentFromCache(map, "key1")).toEqual([
        { title: "Page" },
      ]);
    });

    it("getContentFromCache returns empty array for missing key", () => {
      const map = new Map();
      expect(store.getters.getContentFromCache(map, "missing")).toEqual([]);
    });
  });
});
