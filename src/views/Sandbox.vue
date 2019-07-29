<template>
  <div v-if="!loading">
    {{ searchIndex }}
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script>
import { getSearchIndex } from "@/services/Search";
export default {
  async created() {
    this.loading = true;
    this.searchIndex = await getSearchIndex();
    this.loading = false;
  },
  data: () => ({
    searchIndex: null,
    loading: true
  })
};
</script>

<style></style>
