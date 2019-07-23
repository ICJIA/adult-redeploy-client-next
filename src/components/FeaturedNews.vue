<template>
  <div>
    <div v-for="n in 3" :key="n" class="mb-3">
      <v-hover v-slot:default="{ hover }">
        <v-card
          class="mx-auto py-5 hover"
          color="white"
          :elevation="hover ? 12 : 2"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline mb-4 heavy">May 23, 2019</div>
              <v-list-item-title class="headline mb-1" style="font-weight: 700"
                >Headline 5</v-list-item-title
              >
              <!-- <v-list-item-subtitle
                >Greyhound divisely hello coldly fonwderfully Greyhound divisely
                hello coldly fonwderfullyGreyhound divisely hello coldly
                fonwderfullyGreyhound divisely hello coldly
                fonwderfullyGreyhound divisely hello coldly fonwderfully
              </v-list-item-subtitle> -->
            </v-list-item-content>

            <!-- <v-list-item-avatar
                  tile
                  size="80"
                  color="grey"
                ></v-list-item-avatar> -->
          </v-list-item>
          <v-card-text style="font-size: 16px"
            >Greyhound divisely hello coldly fonwderfully Greyhound divisely
            hello coldly fonwderfullyGreyhound divisely hello coldly
            fonwderfullyGreyhound divisely hello coldly fonwderfullyGreyhound
            divisely hello coldly</v-card-text
          >
        </v-card>
      </v-hover>
    </div>
    <div class="text-center mt-6">
      <v-btn class="ma-2" to="/news" outlined color="primary"
        >News & Events Archive<v-icon right>chevron_right</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
