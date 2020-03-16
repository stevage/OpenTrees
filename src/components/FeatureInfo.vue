<template lang="pug">
div
    .panel(v-if="feature")
        //- img.image(v-if="imageUrl" :src="imageUrl")
        div.bg-green
            h2.i.lancelot.f3.pa2.mv0.bg-green {{ p.common || p.scientific || p.description }}
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
                //- tr(v-if="p.species")d
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
                td {{ Number.isFinite(Number(p.height)) ? Math.round(Number(p.height)) : p.height }} 
                    span.detail m.
            tr(v-if="p.health")
                th Health
                td {{ p.health }}
            tr(v-if="p.structure")
                th Structure
                td {{ p.structure }}
            tr(v-if="p.planted")
                th Planted date
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
            a(href="#" @click="clickSource") {{ sourceName }}
            span(v-if="p.updated")  ({{ p.updated }})
            span(v-if="license")
                |  (
                a(:href="`https://spdx.org/licenses/${license}`" target="_blank") {{ license }}
                | )
            
        p.f7.mh2.gray.i.mv0 See on 
            a(:href="`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${feature.geometry.coordinates.slice().reverse()}`" target="_blank") StreetView
            | .
        Wikipedia(:searchTerm="p.genus + (p.species ? ' ' + p.species : '')")

</template>

<script>
import Wikipedia from './Wikipedia';
import sources from '../sources';
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
            const r = this.feature && this.feature.properties || {};
            if (!r.scientific && r.genus) {
                r.scientific = r.genus + (r.species ? ` ${r.species}`:'');
            }
            return r;
        },
        imageUrl() {
            return this.p && this.p.image_url
        },
        license() {
            const source = this.p.source && sources.find(s => s.id === this.p.source);
            return source && source.license;
        },
        showExtra() {
            return window.location.hash.match(/debug/);
        },
        // sourceUrl() {
        //     console.log(sources);
        //     const s = sources.find(s => s.id === this.p.source);
        //     return s ? s.info || s.download : '#';
            
        // },
        sourceName() {
            console.log(sources);
            const s = sources.find(s => s.id === this.p.source);
            return s ? (s.long || s.short || s.id) : 'unknown';
        }
        
    },
    created() {
        window.app.FeatureInfo = this;
        EventBus.$on('tree-select', tree => this.feature = tree);
        EventBus.$on('unselect-tree', () => {
            this.feature = null;
        });
    },
    watch: {
        feature(newValue, oldValue) {
            if (newValue) {
                EventBus.$emit('panel-select', 'FeatureInfo');
            }
            
        }
    },
    methods: {
        close() {
            console.log('close');
            this.feature=null;
        },
        clickSource() {
            EventBus.$emit('source-select', this.feature.properties.source);
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