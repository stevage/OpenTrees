<template lang="pug">
#Mode.bg-white.pa1
    div.pa0
        input.ma1.dib#none(type="radio" value="none" v-model="mode") 
        label.pa1.dib(for="none") No vis.
    div.pa0
        input.ma1.dib#species(type="radio" value="species" v-model="mode")
        label.pa1.dib(for="species") Species
    div.pa0
        input.ma1.dib#rarity(type="radio" value="rarity" v-model="mode")
        label.pa1.dib(for="rarity") Rarity
    div.pa0
        input.ma1.dib#noxious(type="radio" value="noxious" v-model="mode")
        label.pa1.dib(for="noxious") Harm
    div.pa0
        input.ma1.dib#local(type="radio" value="local" v-model="mode")
        label.pa1.dib(for="local") Local variety

</template>

<script>
import { EventBus } from '../EventBus'
export default {
    name: "Mode",
    data: () => ({
        mode: 'none'
    }),
    created() {
        window.Mode = this;
    },
    watch: {
        mode() {
            EventBus.$emit('vis-mode', this.mode);
        }
    }
}
</script>

<style scoped>

</style>