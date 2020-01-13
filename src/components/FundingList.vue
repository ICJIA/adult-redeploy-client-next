<template>
  <div>
    <div v-if="loading">
      <loader />
    </div>
    <div
      v-if="filteredFunding.length === 0 && !loading"
      class="text-center mb-10 mt-3"
    >
      <h2>There are no {{ toggleState }} funding opportunities to display.</h2>
    </div>
    <div v-for="item in filteredFunding" v-else :key="item.title">
      <funding-card :item="item" :toggle-state="toggleState" />
    </div>
    <div class="text-center pt-5 pb-5">
      <h3>
        For archived funding opportunities prior to 2019, please see:
        <a href="https://legacy-grants.icjia.cloud/grants"
          >https://legacy-grants.icjia.cloud/grants</a
        >
      </h3>
    </div>
  </div>
</template>

<script>
import FundingCard from "@/components/FundingCard";
import Loader from "@/components/Loader";
export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    FundingCard,
    Loader
  },
  props: {
    funding: {
      type: Array,
      default: () => []
    },
    toggleState: {
      type: String,
      default: "current"
    }
  },
  data() {
    return {
      filteredFunding: [],
      loading: true
    };
  },
  watch: {
    toggleState(newValue, oldValue) {
      NProgress.start();
      this.loading = true;
      const today = new Date();
      const target = new Date(today.setHours(0, 0, 0, 0));

      let filteredFunding = [];
      if (newValue === "current") {
        this.funding.forEach(x => {
          let expiration = new Date(x.expires);
          let expirationAdjusted = new Date(
            expiration.getTime() + 24 * 60 * 60 * 250
          );
          expirationAdjusted = new Date(
            expirationAdjusted.setDate(expirationAdjusted.getDate() + 1)
          );
          let posted = new Date(x.posted);
          let postedAdjusted = new Date(posted.getTime() + 24 * 60 * 60 * 250);
          // console.log(
          //   `Expiration: ${expirationAdjusted} -- Target: ${target} -- Posted: ${postedAdjusted}`
          // )
          if (
            expirationAdjusted > target &&
            x.status === "live" &&
            postedAdjusted <= today
          )
            filteredFunding.push(x);
        });
      } else {
        this.funding.forEach(x => {
          let expiration = new Date(x.expires);
          //console.log(`Expiration: ${expiration} -- Target: ${target}`)
          if (expiration < target && x.status === "live")
            filteredFunding.push(x);
        });
      }
      this.filteredFunding = filteredFunding;
      this.loading = false;
      NProgress.done();
    }
  }
};
</script>

<style lang="scss" scoped></style>
