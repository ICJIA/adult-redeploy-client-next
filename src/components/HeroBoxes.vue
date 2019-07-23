<template>
  <div class="flexbox-container hide-sm-and-down">
    <div class="box box-1" @click="$router.push('/programs')">
      <h2 class="heavy text-center">Local Programs</h2>
      <p class="pt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi dolor mi,
        sollicitudin ut elit ut, tincidunt pulvinar nisl. Fusce auctor, nulla ac
        dapibus dapibus, neque risus molestie nisl, in tempus ligula erat vel
        neque.
      </p>
    </div>
    <div class="box box-2" @click="$router.push('/publications')">
      <h2 class="heavy text-center">Publications</h2>
      <p class="pt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi dolor mi,
        sollicitudin ut elit ut, tincidunt pulvinar nisl. Fusce auctor, nulla ac
        dapibus dapibus, neque risus molestie nisl, in tempus ligula erat vel
        neque.
      </p>
    </div>
    <div class="box box-3" @click="$router.push('/meetings')">
      <h2 class="heavy text-center">Meetings</h2>
      <p class="pt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi dolor mi,
        sollicitudin ut elit ut, tincidunt pulvinar nisl. Fusce auctor, nulla ac
        dapibus dapibus, neque risus molestie nisl, in tempus ligula erat vel
        neque.
      </p>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
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
  background: #045354;
}

.box-2 {
  background: #068587;
}

.box-3 {
  background: #34999b;
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

@media only screen and (max-width: 800px) {
  .flexbox-container {
    flex-direction: column;
  }

  .flexbox-container > div {
    width: 100%;
  }
}
</style>
