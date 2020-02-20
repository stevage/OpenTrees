<template lang="pug">
#Legend.bg-white.pa2(v-if="vals.length")
    div.mb2(v-for="([title, color]) in vals")
        .pill.br4.b--gray.dib.ba.w1.h1.mr2.v-mid(:style="{ background: color}")
        span.f6.pl3.dib(v-html="title")
</template>

<script>
import { EventBus } from '../EventBus';
export default {
    name: "Legend",
    data: () => ({
        vals: []
    }),
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