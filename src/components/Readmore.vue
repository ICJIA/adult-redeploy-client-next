<template>
  <div>
    <div class="readMore" style>
      <div
        :id="id"
        class="section"
        :class="{ fade: isCollapsed && !hideFade && !removeFade }"
        data-collapsed="true"
        :style="{ height: getHeight, transition: getTransitionSpeed }"
      >
        <span
          v-html="content"
          @click="handleClicks"
          class="dynamic-content"
        ></span>
      </div>
    </div>
    <div
      class="mt-0"
      :class="triggerClass"
      v-if="
        (!this.isCollapsed && this.hideReadLess) || this.hideButton
          ? false
          : true
      "
    >
      <button
        type="button"
        @click="toggle()"
        class="readMore btn"
        :class="triggerPosition"
        :style="{ 'font-size': triggerFontSize + 'px' }"
      >
        <span>
          {{ this.isCollapsed ? this.readMoreText : this.readLessText }}
          <span
            v-if="isCollapsed && showWordCount ? true : false"
            class="wordCount"
            >&nbsp;&nbsp;{{ getWordCount }} total words</span
          > </span
        >&nbsp;
        <i class="material-icons">
          {{ this.isCollapsed ? this.readMoreIcon : this.readLessIcon }}
        </i>
      </button>
    </div>
  </div>
</template>

<script>
import { handleClicks } from "@/mixins/handleClicks";
export default {
  mixins: [handleClicks],
  components: {
    // Trigger
  },
  props: {
    content: {
      type: String,
      default: "Content Not Defined"
    },

    readMoreText: {
      type: String,
      default: "Read More"
    },
    readLessText: {
      type: String,
      default: "Read Less"
    },
    readMoreIcon: {
      type: String,
      default: "arrow_drop_down"
    },
    readLessIcon: {
      type: String,
      default: "arrow_drop_up"
    },
    height: {
      type: Number,
      default: 300
    },
    hideFade: {
      type: Boolean,
      default: false
    },
    hideReadLess: {
      type: Boolean,
      default: false
    },
    transitionSpeed: {
      type: Number,
      default: 0.3
    },
    showWordCount: {
      type: Boolean,
      default: false
    },
    triggerPosition: {
      type: String,
      default: "center"
    },
    triggerClass: {
      type: String,
      default: "myTriggerClass"
    },
    triggerFontSize: {
      type: Number,
      default: 11
    }
  },
  data() {
    return {
      id: null,
      isCollapsed: true,
      sectionHeight: null,
      hideButton: false,
      actualHeight: null,
      removeFade: false
    };
  },
  computed: {
    getWordCount() {
      return this.content.split(" ").length;
    },
    getTriggerPosition() {
      return `text-xs-${this.triggerPosition}`;
    },
    getTransitionSpeed() {
      return `height ${this.transitionSpeed}s ease-out`;
    },

    getHeight() {
      if (this.hideButton) {
        return "100%";
      }
      return this.height + "px";
    }
  },
  mounted() {
    /**
     * One way to get a unique id -- the component's own interal id. But folks say to avoid this.
     */
    //this.id = this._uid;
    this.id = this.create_UUID();
    this.$nextTick(() => {
      let sectionHeight = document.getElementById(this.id).scrollHeight;
      this.sectionHeight = sectionHeight;
      //console.log(sectionHeight, this.height);
      if (this.sectionHeight === this.height) {
        this.hideButton = true;
        this.removeFade = true;
      }
    });
    this.handleClicks();
  },
  beforeDestroy() {
    window.removeEventListener("click", () => {});
  },
  methods: {
    handleClicks() {
      window.addEventListener("click", event => {
        const { target } = event;
        // handle only links that do not reference external resources
        if (target && target.matches("a:not([href*='://'])") && target.href) {
          // some sanity checks taken from vue-router:
          // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
          const {
            altKey,
            ctrlKey,
            metaKey,
            shiftKey,
            button,
            defaultPrevented
          } = event;
          // don't handle with control keys
          if (metaKey || altKey || ctrlKey || shiftKey) return;
          // don't handle when preventDefault called
          if (defaultPrevented) return;
          // don't handle right clicks
          if (button !== undefined && button !== 0) return;
          // don't handle if `target="_blank"`
          if (target && target.getAttribute) {
            const linkTarget = target.getAttribute("target");
            if (/\b_blank\b/i.test(linkTarget)) return;
          }
          // don't handle same page links/anchors
          const url = new URL(target.href);
          const to = url.pathname;
          if (window.location.pathname !== to && event.preventDefault) {
            event.preventDefault();
            this.$router.push(to);
          }
        }
      });
    },
    y(f) {
      /**
       * Y Combinator -- since arguments.callee not allowed in strict mode
       * https://stackoverflow.com/questions/19214977/alternative-to-arguments-callee
       */
      return () => {
        return f.bind(null, this.y(f)).apply(this, arguments);
      };
    },
    create_UUID() {
      var dt = new Date().getTime();
      var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
      return uuid;
    },
    collapseSection(element) {
      let sectionHeight = element.scrollHeight;
      let elementTransition = element.style.transition;
      element.style.transition = "";
      requestAnimationFrame(() => {
        element.style.height = sectionHeight + "px";
        element.style.transition = elementTransition;
        requestAnimationFrame(() => {
          element.style.height = this.height + "px";
        });
      });
      element.setAttribute("data-collapsed", "true");
    },
    expandSection(element) {
      let sectionHeight = element.scrollHeight;
      element.style.height = sectionHeight + "px";
      element.addEventListener(
        "transitionend",
        this.y(callee => {
          element.removeEventListener("transitionend", callee);
        })
      );
      element.setAttribute("data-collapsed", "false");
    },
    toggle() {
      let section = document.getElementById(this.id);
      let isCollapsed = section.getAttribute("data-collapsed") === "true";
      if (isCollapsed) {
        this.expandSection(section);
        section.setAttribute("data-collapsed", "false");
      } else {
        this.collapseSection(section);
      }
      this.isCollapsed = !this.isCollapsed;
    }
  }
};
</script>

<style>
/* @import url("https://fonts.googleapis.com/css?family=Material+Icons"); */
.readMore .section {
  overflow: hidden;
  height: auto;
  position: relative;
  z-index: 0;
  font-size: 16px;
  clear: both;
  margin-top: 0;
}
.readMore .fade {
  /* border: 1px #d8d8d8 dashed; */
  position: relative;
}
.readMore .fade:after {
  content: "";
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  pointer-events: none;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgb(255, 255, 255) 60%
  );
  width: 100%;
  height: 4em;
}
.readMore .hidden {
  visibility: hidden;
}
.readMore .material-icons {
  font-family: "Material Icons";
  font-weight: 900;
  vertical-align: middle;
  font-style: normal;
  text-align: center;
  font-size: 11px;
  display: inline-block;
  line-height: 1.5em;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "liga";
}
.readMore.btn {
  position: relative;
  display: block;
  /* margin: 5px auto; */
  /* float: right; */
  padding: 0;
  overflow: hidden;
  border-width: 0;
  outline: none;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  background-color: #fff;
  color: #333;
  /* font-size: 11px; */
  font-weight: 900;
  text-transform: uppercase;
  transition: background-color 0.3s;
  padding: 5px 12px;
}
.readMore.btn:hover {
  background-color: #ccc;
}
.readMore.btn > * {
  position: relative;
}
.readMore.btn:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 0;
  padding-top: 0;
  border-radius: 100%;
  background-color: rgba(236, 240, 241, 0.3);
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.readMore.btn:active:before {
  width: 120%;
  padding-top: 120%;
  transition: width 0.2s ease-out, padding-top 0.2s ease-out;
}
.readMore.btn .wordCount {
  font-weight: 400;
  color: #555;
}
.center {
  margin: 5px auto;
}
.right {
  float: right;
  margin-bottom: 45px;
}
.left {
  float: left;
  margin-bottom: 45px;
}
</style>
