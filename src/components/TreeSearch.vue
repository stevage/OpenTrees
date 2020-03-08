<template lang="pug">
#TreeSearch.bg-white
    label.ma1(for="filter") Tree filter
    input#filter.ma1(v-model="filter")
</template>

<script>
import { EventBus } from '../EventBus';
export default {
    name: "TreeSearch",
    data: () => ({
        filter: ''
    }),
    created() {
        window.TreeSearch = this;
    },
    watch: {
        filter(newValue, oldValue) {
            EventBus.$emit('species-filter', newValue);
        }
    },
}
</script>

<style scoped>

</style>