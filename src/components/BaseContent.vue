<template>
  <div>
    <div style="background: #eee;" class="py-9" v-if="!loading">
      <slot name="content"></slot>
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
      type: Boolean
    },
    content: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss" scoped></style>
