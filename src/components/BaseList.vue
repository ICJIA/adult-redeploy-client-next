<template>
  <div>
    <div v-if="items.length === 0">
      <h2 class="text-center py-5" style="color: #777">{{ empty }}</h2>
    </div>
    <div v-else>
      <div v-for="(item, index) in items" :key="index">
        <slot v-bind="item" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseList",
  props: {
    items: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: "No title specified"
    },
    empty: {
      type: String,
      default: "Move along. Nothing here."
    }
  }
};
</script>

<style scoped></style>
