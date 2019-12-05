<template>
  <div>
    <span v-if="tags.length" class="pt-3">
      <span v-for="(tag, index) in tags" :key="index" class="pl-1 pr-1 ">
        <!-- <div :to="`/tags/${tag.slug}`" class="tag-link"> -->
        <span @click.prevent.stop="routeTo(`/tags/${tag.slug}`)">
          <v-chip
            :small="true"
            label
            color="green darken-4"
            class="chip mt-2"
            text-color="white"
          >
            <v-icon left color="grey lighten-4">label</v-icon
            >{{ tag.name | upperCase }}
          </v-chip>
        </span>

        &nbsp;
      </span>
      <!-- <v-chip
        :small="true"
        label
        color="grey"
        class="chip mt-2"
        text-color="black"
      >
        <v-icon color="grey lighten-4">more_horiz</v-icon>
      </v-chip> -->
    </span>
    <!-- <span v-else :class="background" class="no-tags">No tags here!</span> -->
  </div>
</template>

<script>
// import { EventBus } from "@/event-bus";
export default {
  data() {
    return {
      maxTags: 2,
      showAll: false
    };
  },
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    background: {
      type: String,
      default: "light"
    }
  },
  mounted() {},
  methods: {
    routeTo(route) {
      this.$router.push(route).catch(() => {
        this.$vuetify.goTo(0);
      });
    }
  }
};
</script>

<style>
a.tag-link {
  text-decoration: none;
}

a.tag-link:hover {
  cursor: pointer;
}

.v-chip--label .v-chip__content {
  cursor: pointer;
  font-size: 9px;
  font-weight: 900;
}

.v-chip.v-chip:hover {
  background: #ccc !important;
  color: #aaa !important;
}

/* .tag:hover {
} */
/* .tag.light {
  font-weight: bold;
  border: 1px solid #ccc;
  padding: 2px 3px;
  border-radius: 5px;
  text-transform: uppercase;
}

.tag.light:hover {
  color: #fff;
  background: purple;
  border: 1px solid purple;
}

.tag.dark {
  font-weight: bold;
  border: 0px solid #eee;
  padding: 2px 3px;
  color: #ccc;
  border-radius: 5px;
  text-transform: uppercase;
}

.tag.dark:hover {
  color: #333;
  background: #fff;
  border: 0px solid #fff;
}

.no-tags.dark {
  color: #fff;
}

.no-tags.light {
  color: #333;
} */
</style>
