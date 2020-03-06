<template lang="pug">
#Mode.bg-white.pa1
    #dropdown.only-mobile.pa1.pr3.ba.b--light-gray(@click="open = !open") {{ selectedModeCaption }}
        //- i.ml2.fas.fa-caret-down
        i.absolute.right-0.mr1.fas.fa-caret-down
    #options(:class="{ 'not-mobile': !open}")
        div(v-for="([mode, caption]) in modes" @click="open = false")
            input.ma1.dib#none(:id="mode" type="radio" :value="mode" v-model="selectedMode") 
            label.pa1-ns.dib(:for="mode") {{ caption }}

</template>

<script>
import { EventBus } from '../EventBus'
export default {
    name: "Mode",
    data: () => ({
        selectedMode: 'none',
        
        open: false,
        modes: [
                ['none', 'No vis.'],
                ['species', 'Botanical group'],
                ['family', 'Family'],
                ['rarity', 'Rarity'],
                ['local', 'Species in view'],
                ['trunk', 'Trunk size'],
                ['health', 'Health'],
                ['maturity', 'Maturity'],
                ['edible','Edible'],
                ['label', 'Label'],
                ['harm', 'Harm'],

        ]
    }),
    created() {
        window.Mode = this;
    },
    mounted () {
        // EventBus.$emit('vis-mode', this.selectedMode);
    },
    computed: {
        selectedModeCaption() {
            return this.modes.find(([mode, caption]) => mode === this.selectedMode)[1];
        }
    },
    watch: {
        selectedMode() {
            EventBus.$emit('vis-mode', this.selectedMode);
        }
    }
}
</script>

<style scoped>

</style>