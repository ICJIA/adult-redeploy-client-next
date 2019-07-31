/* eslint-disable no-console */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

function buildStatusUrl() {
  let url;
  let endpoint = "/.netlify/functions/status";
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    url = `http://localhost:9000${endpoint}`;
  } else {
    url = `https://ari-dev.netlify.com${endpoint}`;
  }
  return url;
}

async function fetchData(endpoint) {
  // eslint-disable-next-line no-unused-vars
  let data;
  let response = await fetch(endpoint);
  return (data = await response.json());
}

export default new Vuex.Store({
  state: {
    isAppReady: false,

    config: null,
    routes: null,
    sections: null,
    searchIndex: null,
    lastDeploy: null,
    lastBuild: null,
    apiStatus: null,
    cache: new Map(),
    jwt: localStorage.getItem("jwt") || "",
    userMeta: JSON.parse(localStorage.getItem("userMeta")) || ""
  },
  mutations: {
    CLEAR_CACHE(state) {
      state.cache.clear();
      console.log("Cache cleared");
    },
    SET_APP_READY(state, bool) {
      state.isAppReady = bool;
      console.log("isAppReady", bool);
    },
    SET_CONFIG(state, config) {
      state.config = config;
      console.log("Config loaded");
    },
    SET_ROUTES(state, routes) {
      state.routes = routes;
      console.log("Routes loaded");
    },
    SET_SEARCH_INDEX(state, searchIndex) {
      state.searchIndex = searchIndex;
      console.log("Search index loaded");
    },
    SET_CACHE(state, { hash, query }) {
      state.cache.set(hash, query);
      //console.log(hash, ": cached");
    },
    SET_SECTIONS(state, sections) {
      state.sections = sections;
      console.log("Sections loaded");
    },
    SET_API_STATUS(state, apiStatus) {
      state.apiStatus = apiStatus;
      console.log("API status code: ", apiStatus);
    }
  },
  actions: {
    async initApp({ commit }) {
      commit("CLEAR_CACHE");
      commit("SET_APP_READY", true);
    },
    async setApiStatus({ commit }) {
      try {
        let status = await fetchData(buildStatusUrl());
        let apiStatus = status.filter(server => {
          if (server.server === "api") {
            return server;
          }
        });
        if (apiStatus.length) {
          console.log("Successfully connected to status server.");
          commit("SET_API_STATUS", apiStatus[0]["status"]);
        } else {
          console.error("Status server error");
          commit("SET_API_STATUS", 500);
        }
      } catch (e) {
        console.log("Can't connect to status server.");
        commit("SET_API_STATUS", 500);
      }
    },
    setConfig({ commit }, config) {
      commit("SET_CONFIG", config);
    },
    setRoutes({ commit }, routes) {
      commit("SET_ROUTES", routes);
    },
    setSearchIndex({ commit }, searchIndex) {
      commit("SET_SEARCH_INDEX", searchIndex);
    },
    setSections({ commit }, sections) {
      commit("SET_SECTIONS", sections);
    },
    // eslint-disable-next-line no-unused-vars
    async cacheContent({ commit, state, getters }, contentMap) {
      let start = new Date();
      let queries = [],
        res,
        end,
        hashes = [];

      // eslint-disable-next-line no-unused-vars
      for (const [key, value] of contentMap.entries()) {
        let params;
        if (!value.hash) {
          throw "Hash must be specified";
        }
        if (!value.query) {
          throw "Query must be specified";
        }

        value.params ? (params = value.params) : (params = {});
        if (!getters.inCache(value.hash, state.cache)) {
          hashes.push(value.hash);
          queries.push(value.query.call(this, params));
        } else {
          //console.log("already in cache");
        }
      }

      if (queries.length) {
        res = await Promise.all(queries);
        res.forEach((query, index) => {
          let cacheObj = {};
          cacheObj.hash = hashes[index];
          cacheObj.query = query;
          commit("SET_CACHE", cacheObj);
        });
        end = new Date() - start;

        let metaInfo = {
          itemsCached: res.length,
          millisecondsToComplete: end,
          previouslyCached: false,
          cacheSize: state.cache.size
        };

        if (state.config.debug) {
          console.log(metaInfo);
        }

        return metaInfo;
      } else {
        end = new Date() - start;
        let metaInfo = {
          itemsCached: queries.length,
          millisecondsToComplete: end,
          previouslyCached: true,
          cacheSize: state.cache.size
        };
        if (state.config.debug) {
          console.log(metaInfo);
        }
        return metaInfo;
      }
    }
  },
  getters: {
    // eslint-disable-next-line no-unused-vars
    inCache: state => hash => {
      return state.cache.has(hash);
    },
    isApiReady: state => {
      if (state.apiStatus === 200 || state.apiStatus === 204) {
        return true;
      } else {
        return false;
      }
    },
    config: state => {
      return state.config;
    },
    sections: state => {
      return state.sections;
    },
    debug: state => {
      return state.config.debug;
    },
    getContentFromCache: state => (map, key) => {
      if (map.get(key)) {
        let content = state.cache.get(map.get(key).hash);
        return content;
      } else {
        return [];
      }
    }
  }
});
