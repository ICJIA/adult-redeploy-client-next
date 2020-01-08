<template>
  <div class="flexbox-container hide-sm-and-down">
    <div
      class="box box-1"
      @click="
        $router.push('/programs').catch(err => {
          $vuetify.goTo(0);
        })
      "
    >
      <div class="text-center home-font">
        <i class="fas fa-users"></i>
      </div>
      <h2 class="heavy text-center mt-3">Programs</h2>

      <p class="pt-4">
        ARI is based on local control and design because communities know best
        how to protect public safety and reduce recidivism.
      </p>
    </div>
    <div
      class="box box-3"
      @click="
        $router.push('/grants').catch(err => {
          $vuetify.goTo(0);
        })
      "
    >
      <div class="text-center home-font">
        <i class="far fa-money-bill-alt"></i>
      </div>
      <h2 class="heavy text-center mt-3">Grants</h2>
      <p class="pt-4">
        ARI uses “performance incentive funding” to support local investment in
        more effective and less expensive alternatives to incarceration.
      </p>
    </div>
    <div
      class="box box-2"
      @click="
        $router.push('/resources').catch(err => {
          $vuetify.goTo(0);
        })
      "
    >
      <div class="text-center home-font">
        <i class="fas fa-cogs"></i>
      </div>
      <h2 class="heavy text-center mt-3">Resources</h2>
      <p class="pt-4">
        ARI provides training and technical assistance, collects and analyzes
        data, and fosters a statewide learning community.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$emit("home-boxes");
  }
};
</script>

<style scoped>
h2 {
  margin: 0;
  padding: 0;
}
.flexbox-container {
  display: -ms-flex;
  display: -webkit-flex;
  display: flex;
  min-height: 250px;
}

/* .flexbox-container h2 {
  padding-top: 10px;
} */

.flexbox-container > div {
  width: 50%;
  padding: 60px 30px;
  color: #fff;
  font-size: 18px;
}

.flexbox-container > div:last-child {
  border-right: 0px;
}

.box-1 {
  background: #065f60;
}

.box-2 {
  background: #067879;
}

.box-3 {
  background: #068384;
}

.box:hover {
  box-shadow: 0px 0px 15px #000000;
  z-index: 2;
  -webkit-transition: all 100ms ease-in;
  -webkit-transform: scale(1.01);
  -ms-transition: all 100ms ease-in;
  -ms-transform: scale(1.01);
  -moz-transition: all 100ms ease-in;
  -moz-transform: scale(1.01);
  transition: all 100ms ease-in;
  transform: scale(1.01);
  cursor: pointer;
}

.home-font {
  font-size: 66px;
}

@media only screen and (max-width: 800px) {
  .flexbox-container {
    flex-direction: column;
  }

  .flexbox-container > div {
    width: 100%;
  }
}
</style>
