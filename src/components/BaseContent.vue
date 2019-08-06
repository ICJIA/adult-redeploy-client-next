<template>
  <div>
    <div class="py-9 px-2" v-if="!loading">
      <slot name="title"></slot>
      <slot name="printer"></slot>
      <slot name="content"></slot>
      <slot name="special"></slot>
      <slot name="page-list"></slot>
      <slot name="site-list"></slot>
    </div>
    <div v-else>
      <v-container>
        <v-layout wrap>
          <v-flex>
            <loader></loader>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </div>
</template>

<script>
import Loader from "@/components/Loader";
export default {
  components: {
    Loader
  },
  props: {
    loading: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped></style>
