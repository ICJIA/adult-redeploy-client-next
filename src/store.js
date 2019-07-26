/* eslint-disable no-console */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

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
      //console.log(hash, ": cached");
    }
  },
  actions: {
    async initApp({ commit }) {
      commit("SET_APP_READY", true);
      commit("CLEAR_CACHE");
      console.log("App initialized");
    },
    setConfig({ commit }, config) {
      commit("SET_CONFIG", config);
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
    config: state => {
      return state.config;
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
