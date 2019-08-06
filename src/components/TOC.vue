<template>
  <div class="pl-10 toc">
    <div
      style="margin-left: -3px; font-weight: bold;"
      ref="anchor"
      class="mb-4 hover anchor"
      @click="$vuetify.goTo(0)"
    >
      NAVIGATION
    </div>
    <div class="divider">
      <ul class="toc-list">
        <li
          v-for="(item, index) in toc"
          :key="index"
          @click="scrollTo(item.id)"
        >
          <span :id="`scrollTo-${item.id}`" class="tocItem">{{
            item.text
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      toc: []
    };
  },
  props: {
    selector: {
      type: String,
      default: "#scrollArea"
    },
    top: {
      type: String,
      default: "#baseContentTop"
    }
  },
  methods: {
    scrollTo(id) {
      //console.log(id);
      this.$vuetify.goTo(`#${id}`, { offset: 100 });
    },
    setToc() {
      const sections = Array.from(document.querySelectorAll("h2"));
      sections.forEach(section => {
        let obj = {};
        obj.text = section.innerText;
        obj.id = section.id;
        this.toc.push(obj);
      });
    }
  },
  async mounted() {
    await this.setToc();
    var section = document.querySelectorAll("h2");
    var sections = {};
    var i = 0;
    this.$refs["anchor"].classList.add("visible");
    section.forEach(e => {
      sections[e.id] = e.offsetTop - 50;
    });

    window.onscroll = () => {
      var scrollPosition =
        document.documentElement.scrollTop || document.body.scrollTop;
      const tocItems = document.querySelectorAll(".tocItem");

      if (scrollPosition < 100) {
        tocItems.forEach(toc => {
          toc.classList.remove("visible");
        });
        this.$refs["anchor"].classList.add("visible");
      } else {
        this.$refs["anchor"].classList.remove("visible");
      }
      //console.log(scrollPosition);
      for (i in sections) {
        if (sections[i] <= scrollPosition) {
          const sectionItem = document.getElementById(`scrollTo-${i}`);

          tocItems.forEach(toc => {
            toc.classList.remove("visible");
          });
          sectionItem.classList.add("visible");
        }
      }
    };
  },
  beforeDestroy() {
    window.onscroll = () => {};
  }
};
</script>

<style>
.divider {
  border-left: 1px solid #ccc;
}

.toc {
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 125px;
}

ul.toc-list {
  list-style-type: none;
}

ul.toc-list li {
  color: #999;

  padding: 2px 5px 2px 5px;
  cursor: pointer;
  margin-bottom: 8px;
  font-size: 12px;
}

ul.toc-list li:hover {
  color: #065f60;
  background: #eee;
}

.visible {
  color: #057879;
  font-weight: bold;
}
.anchor {
  padding: 2px 5px 2px 5px;
}
.anchor:hover {
  color: #057879;
  background: #eee;
}
</style>
