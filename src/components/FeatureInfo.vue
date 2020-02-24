<template lang="pug">
div
    div(v-if="feature" style="width:300px; position:relative;")
        //- img.image(v-if="imageUrl" :src="imageUrl")
        div.bg-green
            h2.i.lancelot.f3.pa2.mv0.bg-green {{ p.common || p.scientific }}
            .close-btn.pa3.pointer.fw6(@click="feature=null" style="position:absolute;right:0;top:0; cursor:pointer;") X
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
            tr(v-if="p.description")
                th Description
                td {{ p.description }}
            tr(v-if="p.variety")
                th Variety
                td {{ p.variety }}
            tr(v-if="p.dbh")
                th Diameter
                td {{ p.dbh }} 
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
                
            //- tr(v-for="(value, prop) in p")
            
            //-     template(v-if="ignoreProps.indexOf(prop) === -1")
            //-         th.f6.dark-green {{ prop }}
            //-         td.f6 {{ value }}
        p.f7.gray.mh2.i Source: 
            a(:href="sourceUrl(p.source)" target="_blank") {{ sourceName(p.source) }}
        Wikipedia(:searchTerm="p.genus + (p.species ? ' ' + p.species : '')")
    .not-mobile(v-else) Click on a tree for information!
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
        }
    },
    created() {
        window.app.FeatureInfo = this;
    },
    watch: {
        feature(newValue, oldValue) {
            EventBus.$emit('resize');
            
        }
    },
    methods: {
        sourceUrl(source) {
            console.log(sources);
            console.log(source);
            return sources.find(s => s.id === source).download;
            
        },
        sourceName(source) {
            return sources.find(s => s.id === source).long;
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
</style>