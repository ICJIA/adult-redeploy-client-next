<template>
  <div>
    <div
      class="px-4"
      v-if="!loading"
      :class="{ 'py-10': !$browserDetect.isIE }"
    >
      <slot name="title"></slot>
      <slot name="printer"></slot>
      <slot name="content"></slot>
    </div>
    <div v-else>
      <v-container>
        <v-row>
          <v-col>
            <loader></loader>
          </v-col>
        </v-row>
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
