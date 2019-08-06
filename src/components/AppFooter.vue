<template>
  <v-footer dark padless class="noprint">
    <v-card
      flat
      tile
      class="white--text text-center"
      color="secondary"
      style="width: 100%"
    >
      <v-card-text>
        <span v-for="link in sections" :key="link.title" class="flexitem">
          <span v-if="link.displayFooter">
            <v-btn
              :to="link.slug === 'home' ? '/' : `/${link.slug}`"
              depressed
              class="heavy "
              dark
              color="secondary"
              :aria-label="link.name"
            >
              <span style="font-size: 12px"> {{ link.slug }}</span>
            </v-btn>
          </span>
        </span>
      </v-card-text>
    </v-card>
    <v-card
      flat
      tile
      class="white--text text-center"
      color="primary"
      style="width: 100%"
    >
      <v-divider></v-divider>

      <v-card-text class="white--text">
        <img
          src="/icjia-logo-white.png"
          alt="Illinois Criminal Justice Information Authority"
          width="65"
          class="mt-3"
        />
        <br />

        <v-btn
          v-for="icon in icons"
          :key="icon"
          class="white--text"
          icon
          :aria-label="icon"
        >
          <v-icon size="18px">{{ icon }}</v-icon>
        </v-btn>
        <br />
        <div style="font-size: 12px">
          {{ new Date().getFullYear() }}
          <strong
            ><a href="http://www.icjia.state.il.us" class="footer-link"
              >Illinois Criminal Justice Information Authority</a
            ></strong
          >&nbsp;|&nbsp;<strong
            ><a
              href="https://github.com/ICJIA/adult-redeploy-client-next"
              target="_blank"
              class="footer-link"
              >Github</a
            ></strong
          >&nbsp;|&nbsp;<strong
            ><a href="/status.html" target="_blank" class="footer-link"
              >Server Status</a
            ></strong
          >
        </div>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  props: {
    sections: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    icons: ["fab fa-facebook", "fab fa-twitter"]
  })
};
</script>

<style>
.footer-link {
  color: #fff !important;
  text-decoration: none;
}

.footer-link:hover {
  color: #aaa !important;
}
</style>
