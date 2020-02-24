<template lang="pug">
    #app.flex.flex-column.vh-100.avenir
        #top.bb.b--gray.bg-green
            img.w2-ns.w1.dib.fl.ma2(src="cubetree-logo.png")
            h1.f1-ns.f5.ma2-ns.lancelot.dark-green.dib.fl OpenTrees.org
            h2.f2-ns.f6.lancelot.ml4-ns.ml2.mb0.mt3-ns.fl.dark-gray 929,055 open data trees from 28 sources.
        #middle.flex.flex-auto
            #sidebar.br.b--gray.overflow-auto
                FeatureInfo
            #map-container.relative.flex-auto
                Map
                #overlay.absolute.ba.b--gray.shadow-3.ml2-ns.mt2-ns.mw5.mw-none-ns.overflow-scroll
                    Mode
                    Legend
                    
        #bottom.bt.b--light-gray.flex-none.pa1.shadow-3
            | Created by <a href="https://twitter.com/stevage1/">Steve Bennett</a>. 
            | Source code on <a href="https://github.com/stevage/OpenTrees">Github</a>.
            | <a href="https://stevebennett.me/2015/04/07/opentrees-org-how-to-aggregate-373000-trees-from-9-open-data-sources/">Blog post #1</a> (2015). 
            | <a href="https://stevebennett.me/2018/05/15/you-might-not-need-postgis-streamlined-vector-tile-processing-for-big-map-visualisations/">Blog post #2</a> (2018).

</template>

<script>
import Map from './components/Map.vue'
import FeatureInfo from './components/FeatureInfo.vue'
import Mode from './components/Mode.vue';
import Legend from './components/Legend.vue';
import { EventBus } from './EventBus';

window.app = { }
export default {
    name: 'app',
    components: {
      Map,
      FeatureInfo,
      Mode,
      Legend,
    },
    created() {
        window.app.App = this;
    }
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

    

</style>
