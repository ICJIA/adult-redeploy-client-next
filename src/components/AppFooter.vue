<template>
  <v-footer dark padless>
    <v-card
      flat
      tile
      class="white--text text-center"
      color="secondary"
      style="width: 100%"
    >
      <v-card-text>
        <span v-for="link in sections" :key="link.name" class="flexitem">
          <span v-if="link.displayFooter">
            <v-btn
              :to="link.url"
              depressed
              class="heavy "
              dark
              color="secondary"
              :aria-label="link.name"
            >
              <span style="font-size: 12px"> {{ link.name }}</span>
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
      <!-- <v-card-text>
        <v-btn v-for="icon in icons" :key="icon" class="white--text" icon>
          <v-icon size="24px">{{ icon }}</v-icon>
        </v-btn>
      </v-card-text> -->

      <!-- <v-card-text class="white--text pt-0">
        Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet.
        Mauris cursus commodo interdum. Praesent ut risus eget metus luctus
        accumsan id ultrices nunc. Sed at orci sed massa consectetur dignissim a
        sit amet dui. Duis commodo vitae velit et faucibus. Morbi vehicula
        lacinia malesuada. Nulla placerat augue vel ipsum ultrices, cursus
        iaculis dui sollicitudin. Vestibulum eu ipsum vel diam elementum tempor
        vel ut orci. Orci varius natoque penatibus et magnis dis parturient
        montes, nascetur ridiculus mus.
      </v-card-text> -->

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
        {{ new Date().getFullYear() }}
        <strong
          ><a href="http://www.icjia.state.il.us" class="footer-link"
            >Illinois Criminal Justice Information Authority</a
          ></strong
        >
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
    icons: ["fab fa-facebook", "fab fa-twitter", "fab fa-github"]
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
