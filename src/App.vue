<template lang="pug">
    #app.flex.flex-column.vh-100.avenir
        #top.bb.b--gray.bg-green
            img.w2.dib.fl.ma2(src="cubetree-logo.png")
            h1.f1.ma2.lancelot.dark-green.dib.fl OpenTrees.org
            h2.f2.lancelot.ml4.mb0.mt3.fl.gray 893,493 open data trees
        #middle.flex.flex-auto
            #sidebar.br.b--gray.overflow-auto(style="width:300px")
                FeatureInfo
            #map-container.relative.flex-auto
                Map
                #overlay.absolute.ba.b--gray.shadow-3.ml2.mt2
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
window.app = {
}
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
    min-width:200px;
}

</style>
