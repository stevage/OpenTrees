<template lang="pug">
    #app.flex.flex-column.vh-100.avenir
        #top.bb.b--gray.bg-green.haoeu3-ns
            h1.f1-ns.f5.ma2-ns.lancelot.dib.fl 
                img.w2-ns.w1.dib.fl.ma2(src="cubetree-logo.png")
                span.dark-green OpenTrees.org
                span.dark-gray.ml2.ml4-ns.f3-ns {{ stats.openTrees.toLocaleString()}} open data trees from {{ stats.sources }} sources in {{ stats.countries.length}} countries.
        #middle.flex.flex-auto
            #sidebar.br.b--gray.overflow-y-scroll.overflow-x-hidden
                FeatureInfo
                SourceInfo
            #map-container.relative.flex-auto
                Map
                #overlay.absolute.ba.b--gray.shadow-3.ml2-ns.mt2-ns.mw5.mw-none-ns.overflow-y-scroll
                    Mode
                    Legend
                    
        #bottom.bt.b--light-gray.flex-none.pa1.shadow-3
            | Created by <a href="https://twitter.com/stevage1/">Steve Bennett</a>. 
            a(href="#" @click="about") About OpenTrees.org
            | .

</template>

<script>
import Map from './components/Map.vue'
import FeatureInfo from './components/FeatureInfo.vue'
import SourceInfo from './components/SourceInfo.vue'
import Mode from './components/Mode.vue';
import Legend from './components/Legend.vue';
import { EventBus } from './EventBus';
import stats from './stats.json';
window.app = { }
export default {
    name: 'app',
    data() {
        return {
            stats
        }
    },
    components: {
      Map,
      FeatureInfo,
      SourceInfo,
      Mode,
      Legend,
    },
    created() {
        window.app.App = this;
    },
    methods: {
        about() {
            EventBus.$emit('about');
            
        }
    },
}

require('tachyons/css/tachyons.min.css');
</script>

<style>
html, body {
  height: 100vh;
  width: 100%;
  margin:0;
  padding:0;
}
#sidebar {
    /* min-width:200px; */
}
@media screen and (max-width:768px) {
    .not-mobile {
        display: none;
    }
    #overlay {
        max-height: 12rem;
    }
}
@media screen and (min-width:768px) {
    .only-mobile {
        display: none;
    }
    #overlay {
        max-height: calc(100vh - 8rem - 20px)
    }
}

.bg-green {
    background: hsl(98.6, 30.4%, 82%) !important;
}

.dark-green {
    color: hsl(100, 29.4%, 30%) !important;
}

.light-green {
    color: hsl(100, 29.4%, 50%) !important;
}

.bg-light-green {
    background: hsl(100, 29.4%, 90%) !important;
}

.lancelot {
    font-family:lancelot,sans-serif;
}

a {
    color: hsl(100, 30%, 30%);
}
a:hover {
    color: hsl(100,30%,60%);
}
    

</style>
