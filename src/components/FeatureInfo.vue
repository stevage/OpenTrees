<template lang="pug">
div
    .panel(v-if="feature")
        //- img.image(v-if="imageUrl" :src="imageUrl")
        div.bg-green
            h2.i.lancelot.f3.pa2.mv0.bg-green {{ p.common || p.scientific || p.description }}
            i.close-btn.pa2.mt1.dark-green.pointer.fw6.fas.fa-times(@click="close" style="position:absolute;right:0;top:0; cursor:pointer;")
        div.cl(v-if="p.class").f7.pa2.i
            | {{ p.class }} 
            span.light-green > 
            | {{ p.subclass }} 
            span.light-green > 
            | {{ p.family }}
            
        table#FeatureInfo(v-if="feature").bg-white.helvetica.ma1
            tr(v-if="p.scientific")
                th Scientific name
                td {{ p.scientific }}
            template(v-if="showExtra")
                tr(v-if="p.genus")
                    th Genus/species
                    td {{ p.genus }} {{ p.species }}
                //- tr(v-if="p.species")
                //-     th Species
                //-     td {{ p.species }}
            tr(v-if="p.common")
                th Common name
                td {{ p.common }}
            tr(v-if="!p.common && !p.scientific")
                //- th Scientific name
                td No species information available.
            tr(v-if="p.description")
                th Description
                td {{ p.description }}
            tr(v-if="p.variety")
                th Variety
                td {{ p.variety }}
            tr(v-if="Number.isFinite(Number(p.dbh))")
                th Diameter
                td {{ Math.round(p.dbh) }} 
                    span.detail cm.
            tr(v-if="p.height")
                th Height
                td {{ p.height }} 
                    span.detail m.
            tr(v-if="p.planted")
                th Planted
                td {{ p.planted }}
            tr(v-if="p.maturity")
                th Maturity
                td {{ p.maturity }}
            //- tr(v-if="p.")
            //-     th 
            //-     td {{ p }}
            tr(v-if="p.species_count")
                th Count
                td {{ p.species_count.toLocaleString() }} 
                    span.detail similar trees
            tr(v-if="p.ref")
                th ID
                td {{ `#${p.ref}` }}
            template(v-if="showExtra")
                tr(v-for="(value, prop) in p")
                
                    template(v-if="ignoreProps.indexOf(prop) === -1")
                        th.f6.dark-green {{ prop }}
                        td.f6 {{ value }}
        p.f7.gray.mh2.i.mv0 Source: 
            a(:href="sourceUrl" target="_blank") {{ sourceName }}
        p.f7.mh2.gray.i.mv0 See on 
            a(:href="`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${feature.geometry.coordinates.slice().reverse()}`" target="_blank") StreetView
            | .
        Wikipedia(:searchTerm="p.genus + (p.species ? ' ' + p.species : '')")
    //- .panel.pa3(v-if="!feature && (firstTime)") 
    //-     b.dark-green(v-if="firstTime") Click on a tree for information!
    .panel.pa2(v-if="!feature && about")
        i.close-btn.pa2.mt1.dark-green.pointer.fw6.fas.fa-times(@click="close" style="position:absolute;right:0;top:0; cursor:pointer;")
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
            li To plan ahead, so lots of old trees don't die at the same time.
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
        p <a href="https://stevebennett.me/2015/04/07/opentrees-org-how-to-aggregate-373000-trees-from-9-open-data-sources/">This old blog post (2015)</a> tells the original story. 
        p <a href="https://stevebennett.me/2018/05/15/you-might-not-need-postgis-streamlined-vector-tile-processing-for-big-map-visualisations/">This one (2018)</a> covers an update and technology change. 
        p Now I need to write the next one!
        h4 Where is the source code?
        p On <a href="https://github.com/stevage/opentrees">Github</a>.
        h4 Who made this?
        p Me, Steve Bennett, a freelance web developer, data visualisation and Mapbox expert based in Melbourne, Australia. 
         | You can see the rest of my portfolio at <a href="https://hire.stevebennett.me">hire.stevebennett.me</a>.
</template>

<script>
import Wikipedia from './Wikipedia';
// import sources from '../sources';
import sources from '../sources-out.json';
import { EventBus } from '../EventBus';
export default {
    name: "FeatureInfo",
    data: () => ({
        feature: undefined,
        firstTime: true,
        about: true,
        ignoreProps: ['id','Longitude','Latitude', 'image_url']
    }),
    components: { Wikipedia },
    computed: {
        p() {
            return this.feature && this.feature.properties || {};
        },
        imageUrl() {
            return this.p && this.p.image_url
        },
        showExtra() {
            return window.location.hash.match(/debug/);
        },
        sourceUrl() {
            console.log(sources);
            const s = sources.find(s => s.id === this.p.source);
            return s ? s.download : '#';
            
        },
        sourceName() {
            console.log(sources);
            const s = sources.find(s => s.id === this.p.source);
            return s ? (s.long || s.short || s.id) : 'unknown';
        }
        
    },
    created() {
        window.app.FeatureInfo = this;
        EventBus.$on('about', () => {
            this.feature = null;
            this.about = true;
        });
        EventBus.$on('unselect-tree', () => {
            this.feature = null;
            this.about = false;
        });
    },
    watch: {
        feature(newValue, oldValue) {
            if (newValue) {
                this.firstTime = false;
            }
            EventBus.$emit('resize');

            
        }
    },
    methods: {
        close() {
            this.feature=null;
            this.about = false;
        }
    },
}
</script>

<style scoped>
#FeatureInfo th {
    text-align:  right;
}

.image {
    width: 100%;
}
</style>
<style>
th {
    color: hsl(100, 29.4%, 30%)
}
td {
    padding-left:8px;
}
.detail {
    /* color:#444; */
    font-weight:200;
    font-size:75%;
}

.panel {
     width:300px; 
     position:relative;
}

/* h2, h3, h4 {
    font-family: Lancelot,Arial,Open Sans;
} */
</style>