/* eslint-disable no-console */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const configPromise = process.BROWSER_BUILD
  ? import("@/config.json")
  : Promise.resolve(require("@/config.json"));

export default new Vuex.Store({
  state: {
    isAppReady: false,
    config: null,
    lastDeploy: null,
    lastBuild: null,
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
    },
    SET_CONFIG(state, config) {
      state.config = config;
    },
    SET_CACHE(state, { hash, query }) {
      state.cache.set(hash, query);
      console.log(hash, ": cached");
    }
  },
  actions: {
    async initApp({ commit }) {
      const config = await configPromise;
      commit("SET_CONFIG", config);
      commit("SET_APP_READY", true);
      commit("CLEAR_CACHE");
      console.log("App initialized");
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
          console.log("already in cache");
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
        // console.log(`cacheContent() timing: ${end}ms`);
        return { status: 200, itemCached: res.length, totalTime: end };
      } else {
        end = new Date() - start;
        return { status: 200, itemCached: 0, time: end };
      }
    }
  },
  getters: {
    // eslint-disable-next-line no-unused-vars
    inCache: state => hash => {
      return state.cache.has(hash);
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
