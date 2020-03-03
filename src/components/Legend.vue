<template lang="pug">
#Legend.bg-white
    .red(v-if="zoomWarning") {{ zoomWarning }}
    div.pa2(v-if="!zoomWarning && vals.length")
        div(v-if="mode === 'local'")
            .f7.i.mt0.mb2-ns The most common species in the current map view
        div.mb2-ns(v-for="([title, color]) in vals")
            .pill.br4.b--gray.dib.ba.w1.h1.mr0.v-top(:style="{ background: color}")
            span.f6.pl3.dib(v-html="title")
</template>

<script>
import { EventBus } from '../EventBus';
export default {
    name: "Legend",
    data: () => ({
        vals: [],
        zoom: undefined,
        mode: undefined
    }),
    computed: {
        zoomWarning() {
            const minZooms = {
                family: 10,
                rarity: 10,
                local: 12,
                trunk: 13,
                label: 16,
                health:10
            }

            if (this.zoom <= (minZooms[this.mode] || 1)) {
                return 'Zoom in for this mode.'
            }
            return '';
            
        },
        
    },
    created() {
        window.Legend = this;
        EventBus.$on('update-legend', vals => {
            this.vals = vals
        });
        EventBus.$on('zoom-change', zoom => this.zoom = zoom);
        EventBus.$on('vis-mode', mode => this.mode = mode);
    }
}
</script>

<style scoped>

</style>