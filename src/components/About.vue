<template lang="pug">
#About.ph2
    //- i.close-btn.pa2.mt1.dark-green.pointer.fw6.fas.fa-times(@click="close" style="position:absolute;right:0;top:0; cursor:pointer;")
    h3 About 
        span.lancelot.dark-green.f3 OpenTrees.org
    p 
        span.lancelot.dark-green.f4 OpenTrees.org 
        | is the world's largest database of municipal street and park trees, produced by harvesting open data from dozens of different sources.
        .i.b.dark-green Click any tree to learn about it.
    h4 Why does this data exist?
    p Local governments collect tree data for several reasons:
    ul
        li To guide their choices of what to plant next.
        li To manage risk of branches falling.
        li To manage pruning, watering and inspection schedules.
        li To plan for continuous canopy coverage as trees age.
    h4 There's a tree missing!
    p Every tree database is incomplete and out of date. A source might be missing a tree because:
        ul
            li It only covers "significant trees".
            li It only includes trees directly managed by the government body, not private properties, schools etc.
            li It only covers parks, or streets.
            li The tree was surveyed once, a long time ago, and the data isn't maintained.
    h4 Why are all the trees showing as grey in some areas?
    p Some of the data sources don't include species information. This can happen when either it isn't collected or isn't included in the data export for some reason.
    h4 Family information is incomplete
    p The source I'm using only covers Australian species. I'll need to do something about that.
    h4 How do I get my city on 
        span.lancelot.dark-green.f4 OpenTrees.org
        | ?
    ol
        li Find out if your city even has a tree database.
        li Find out if it is published as open data. If not, try to convince them to do so.
        li <a href="https://github.com/stevage/opentrees/issues">Raise an issue</a> to include it 
    h4 Is there a way for me to help maintain the tree data in my area?
    p A couple of the tree databases appear to be crowdsourced, such as <a href="https://www.portlandoregon.gov/parks/53181">Portland, Oregon</a>. Most are maintained either directly by government employees, 
        | or outsourced to a specialist arborist company. However it would be possible to start a project on <a href="https://www.inaturalist.org/">inaturalist.org</a> and import that data, for instance.
    h4 How did you build it?
    p <a href="https://stevebennett.me/2015/04/07/opentrees-org-how-to-aggregate-373000-trees-from-9-open-data-sources/">In 2015</a>, it used Postgres and TileMill.
    p <a href="https://stevebennett.me/2018/05/15/you-might-not-need-postgis-streamlined-vector-tile-processing-for-big-map-visualisations/">In 2018</a>, I rewrote it using Mapbox-GL-JS and no database. 
    p In 2020, I rewrote it again using VueJS. (No blog post yet!)
    h4 Where is the source code?
    p On <a href="https://github.com/stevage/opentrees">Github</a>.
    h4 Who made this?
    p Me, Steve Bennett, a freelance web developer, data visualisation and Mapbox expert based in Melbourne, Australia. 
        | You can see the rest of my portfolio at <a href="https://hire.stevebennett.me">hire.stevebennett.me</a>.
</template>

<script>
import { EventBus } from '../EventBus';

export default {
    name: "About",
    data: () => ({
    }),
    created() {
        window.About = this;

    }
}
</script>

<style scoped>

</style>