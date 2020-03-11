<template lang="pug">
#Mode.bg-white.pa1
    #dropdown.only-mobile.pa1.pr3.ba.b--light-gray(@click="open = !open") {{ selectedModeCaption }}
        //- i.ml2.fas.fa-caret-down
        i.absolute.right-0.mr1.fas.fa-caret-down
    #options(:class="{ 'not-mobile': !open}")
        div(v-for="([mode, caption, submodeName]) in modes" @click="open = false")
            input.ma1.dib#none(:id="mode" type="radio" :value="mode" v-model="selectedMode") 
            label.pa1-ns.dib(:for="mode") {{ caption }}
            div(v-if="mode===selectedMode")
                h6.ma0.ml4 {{ submodeName }}
                div(v-for="([submode, subcaption]) in activeSubmodes" @click="open = false")
                    input.ma1.ml4.dib#none(:id="submode" type="radio" :value="submode" v-model="selectedSubmode") 
                    label.pa1-ns.dib(:for="submode") {{ subcaption }}


</template>

<script>
import { EventBus } from '../EventBus'
export default {
    name: "Mode",
    data: () => ({
        selectedMode: 'none',
        selectedSubmode: '1',
        
        open: false,
        modes: [
                ['none', 'No vis.'],
                ['species', 'Botanical group', 'Colour scheme'],
                ['family', 'Family'],
                ['rarity', 'Rarity'],
                ['local', 'Species in view'],
                ['trunk', 'Trunk size'],
                ['health', 'Health'],
                ['maturity', 'Maturity'],
                ['edible','Edible'],
                ['label', 'Label'],
                ['harm', 'Harm'],

        ],
        submodes: {
            species: [
                ['1','Australia'],
                ['2','European']
            ],
            // local: [
            //     ['species','Species'],
            //     ['common','Common name']
            // ]
        }
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
        },
        activeSubmodes() {
            return this.submodes[this.selectedMode]
        },
        selectedModeAndSubmode() {
            return this.selectedMode + (this.activeSubmodes ? this.selectedSubmode : '');
        }
    },
    watch: {
        selectedMode() {
            this.selectedSubmode = this.activeSubmodes ? this.activeSubmodes[0][0] : ''; 
            EventBus.$emit('vis-mode', this.selectedModeAndSubmode);
        },
        selectedSubmode() {
            EventBus.$emit('vis-mode', this.selectedModeAndSubmode);
        }
    }
}
</script>

<style scoped>

</style>