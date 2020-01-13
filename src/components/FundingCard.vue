<template>
  <div>
    <v-card
      class="mb-10 elevation-1 py-6 px-6 funding-card"
      @click="routeToItem(item)"
    >
      <div v-if="toggleState === 'expired'" class="expired">
        Expired: {{ item.expires | format }}
      </div>
      <div v-else class="current">Expires: {{ item.expires | format }}</div>

      <h2 class="pt-0" style="margin-top: 10px">
        {{ item.title }}
      </h2>
      <div class="pt-0">
        {{ item.excerpt }}
      </div>
      <div class="text-right pt-8 posted">
        Posted: {{ item.posted | format }}
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    toggleState: {
      type: String,
      default: ""
    }
  },
  methods: {
    routeToItem(item) {
      // this.$router.push(item.path);
      window.open(`https://icjia.illinois.gov/gata${item.path}`);
    }
  }
};
</script>

<style>
.expired {
  color: #ef5350;
  font-weight: 900;
}

.current {
  font-weight: 900;
  color: #666;
}

.posted {
  font-size: 14px;
  font-weight: 900;
}

.funding-card:hover {
  box-shadow: 0px 0px 15px #000000;
  z-index: 2;
  -webkit-transition: all 100ms ease-in;
  -webkit-transform: scale(1.01);
  -ms-transition: all 100ms ease-in;
  -ms-transform: scale(1.01);
  -moz-transition: all 100ms ease-in;
  -moz-transform: scale(1.01);
  transition: all 100ms ease-in;
  transform: scale(1.01);
  cursor: pointer;
}

.isExpired.v-input--selection-controls.v-input .v-label {
  /* color: #d84315; */
  color: #333;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  padding-left: 5px;
}

.isCurrent.v-input--selection-controls.v-input .v-label {
  color: #333;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  padding-left: 5px;
}
</style>
