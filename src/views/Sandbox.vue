<template>
  <div>
    {{ links }}
    <v-list dense v-for="link in links" :key="link.name">
      <div>
        <v-list-item v-if="!link.subMenu" class="push-right">
          <v-list-item-title>{{ link.name }}</v-list-item-title>
        </v-list-item>

        <v-list-group no-action sub-group v-else>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>{{ link.name }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item v-for="(item, i) in link.subMenu" :key="i" link>
            <v-list-item-title
              v-text="item.name"
              @click="$router.push(item.url)"
            ></v-list-item-title>
          </v-list-item>
        </v-list-group>
      </div>
    </v-list>
  </div>
</template>

<script>
export default {
  created() {
    this.links = this.$store.getters.config.links;
  },
  data: () => ({
    test: "test",
    admins: [["Management", "people_outline"], ["Settings", "settings"]],
    cruds: [
      ["Create", "add"],
      ["Read", "insert_drive_file"],
      ["Update", "update"],
      ["Delete", "delete"]
    ]
  })
};
</script>

<style>
.push-right {
  margin-left: 50px;
}
</style>
