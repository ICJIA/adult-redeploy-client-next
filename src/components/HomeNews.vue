<template>
  <div>
    <div v-for="item in content" :key="item.slug" class="mb-3">
      <v-hover v-slot:default="{ hover }">
        <v-card
          class="mx-auto py-5 hover"
          color="white"
          :elevation="hover ? 18 : 2"
          @click="$router.push(`/news/${item.slug}`)"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline mb-4 heavy">
                {{ item.createdAt | format }}
              </div>
              <v-list-item-title
                :class="{ shaded: hover }"
                class="headline mb-1"
                style="font-weight: 700"
                >{{ item.title | titleCase }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-card-text style="font-size: 16px">
            {{ item.summary }}
          </v-card-text>
        </v-card>
      </v-hover>
    </div>
    <div class="text-center mt-6">
      <v-btn
        class="ma-2"
        to="/news"
        aria-label="News Archive"
        outlined
        color="primary"
        >News & Events Archive<v-icon right>chevron_right</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  }
};
</script>

<style>
.shaded {
  color: #067879;
}
</style>
