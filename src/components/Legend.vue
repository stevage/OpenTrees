<template lang="pug">
#Legend.bg-white.pa2(v-if="vals.length")
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
        vals: []
    }),
    computed: {
        mode() {
            return app.Map.mode; 
        }
    },
    
    created() {
        window.Legend = this;
        EventBus.$on('update-legend', vals => {
            this.vals = vals
        });
    }
}
</script>

<style scoped>

</style>