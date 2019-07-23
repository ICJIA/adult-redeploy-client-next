<template>
  <div style="margin-top: -15px;">
    <carousel></carousel>
    <hero-boxes></hero-boxes>
    <div style="background: #eee;" class="py-9">
      <v-container>
        <v-layout wrap>
          <v-flex
            xs12
            sm12
            md6
            style="padding-left: 30px; padding-right: 30px"
            class="mb-10"
          >
            <h2 class="heavy rule uppercase">About Adult Redeploy Illinois</h2>
            <p>
              <img
                src="/state-seal-color.png"
                width="150"
                alt="Illinois State Seal"
                style="float: left; margin: 4px 10px 0px 0px; "
              />
              Adult Redeploy Illinois was established by the
              <a
                href="http://www.ilga.gov/legislation/publicacts/fulltext.asp?Name=096-0761"
                >Crime Reduction Act (Public Act 96-0761)</a
              >
              to provide financial incentives to local jurisdictions for
              programs that allow diversion of non-violent offenders from state
              prisons by providing community-based services. Grants are provided
              to counties, groups of counties, and judicial circuits to increase
              programming in their areas, in exchange for reducing the number of
              people they send to the Illinois Department of Corrections.
            </p>
            <p>
              The Crime Reduction Act is based on the premise that crime can be
              reduced and the costs of the criminal justice system can be
              controlled by understanding and addressing the reasons why people
              commit crimes. It is also based on the premise that local
              jurisdictions (judicial circuits or counties) know best what
              resources are necessary to reduce crime. Rigorous evaluation
              processes with standardized performance measurements are required
              to confirm the effectiveness of services in reducing crime.
            </p>
            <p>
              The Adult Redeploy Illinois program is an example of a national
              best practice called &quot;performance incentive funding,&quot;
              which other states are adopting in different ways. Adult Redeploy
              Illinois is based on the successful juvenile model which has been
              operating since 2004 with positive results. In the first three
              years of the juvenile Redeploy Illinois program, four pilot sites
              reduced the number of youth sent to the Department of Juvenile
              Justice by 51 percent (well above the 25 percent goal), which
              represents potential youth incarceration cost avoidance to the
              state of nearly $19 million.
            </p>
            <p>
              Results expected with Adult Redeploy Illinois include reduced
              prison overcrowding (based on other states' experiences, with no
              increase in crime); lowered cost to taxpayers ($24,899 a year for
              prison vs. less than $200 total for drug school for first
              offenders or $3,500 on average for drug treatment); an end to the
              expensive vicious cycle of crime and incarceration.
            </p>
            <div class="text-center mt-6">
              <v-btn class="ma-2" to="/programs" outlined color="primary"
                >Find a local program<v-icon right>chevron_right</v-icon></v-btn
              >
            </div>
          </v-flex>

          <v-flex xs12 sm12 md6 class="mb-10">
            <h2 class="heavy rule uppercase">News & Events</h2>
            <featured-news></featured-news>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </div>
</template>

<script>
import Carousel from "@/components/Carousel";
import HeroBoxes from "@/components/HeroBoxes";
import FeaturedNews from "@/components/FeaturedNews";
// import Illinois from "@/components/Illinois";
export default {
  components: {
    Carousel,
    HeroBoxes,
    FeaturedNews
  }
};
</script>

<style></style>
