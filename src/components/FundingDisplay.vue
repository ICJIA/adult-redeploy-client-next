<template>
  <div>
    <div v-if="funding">
      <h2>CURRENT ICJIA FUNDING OPPORTUNITIES</h2>
      <p>
        For more information on the many state and federal grants that
        <a href="https://icjia.illinois.gov">ICJIA</a> administers, along with
        important instruction about the Grants Accountability and Transparency
        Act (GATA), which defines the competitive process for state grant
        awards, visit the
        <a href="https://icjia.illinois.gov/gata">ICJIA GATA site</a>. Sign up
        for the CJ Dispatch to learn about the latest Notices of Funding
        Opportunity.
      </p>
      <FundingToggle></FundingToggle>
      <FundingList :funding="funding" :toggleState="toggleState"></FundingList>
    </div>
  </div>
</template>

<script>
import { EventBus } from "@/event-bus";

import { getGATAFunding } from "@/services/Content";
import FundingToggle from "@/components/FundingToggle";
import FundingList from "@/components/FundingList";
export default {
  data() {
    return {
      funding: null,
      toggleState: null
    };
  },
  components: {
    FundingToggle,
    FundingList
  },
  created() {
    this.fetchContent();
  },
  mounted() {
    EventBus.$on("toggle", state => {
      this.toggleState = state;
      console.log(this.toggleState);
    });
  },
  methods: {
    async fetchContent() {
      try {
        let funding = await getGATAFunding();
        this.funding = funding.data;
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
