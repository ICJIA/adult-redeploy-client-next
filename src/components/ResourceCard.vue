<template>
  <div>
    {{ content }}
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style lang="scss" scoped></style>
