<template lang="pug">
#Stats.ma4.pa2.bg-white(style="height:90%").overflow-scroll.ba.b--gray.shadow-3
        //- h2.mv0 Stats
        //-.absolute(v-for="i in [1,2]")
        div    
                table
                    tr
                        th(colspan="5")
                        td.dark-gray.b--gray.bt.bl.br(:colspan="fields.length" style="text-align:center") Fields available in source data

                    tr
                        th Country
                        th Source
                        th Top tree
                        th Records
                        th Different
                        th(v-for="([fieldName, fieldFunc]) of fields") {{ fieldName }}
                    tr(v-for="source in sources")
                        td {{ source.country }}
                        td.b {{ source.short }}
                        td.i.f7 {{ topTree(source) }}
                        td.f6 {{ source.keepCount.toLocaleString() }}
                        td {{ source.differentSpecies.toLocaleString() }}
                        td.f7(v-for="([fieldName, fieldFunc]) of fields")
                            i.fas.fa-leaf.dark-green(v-if="fieldFunc(source.crosswalk)")
                            span(v-else)
                   
                //- tr(v-for="country in countries")
                //-     th {{ country }}

</template>

<script>
import sources from '../sources';
export default {
    name: "Stats",
    data: () => ({
        fields: [
            ['Species', x => (x.species || x.scientific)],
            ['Common', x => x.common],
            ['DBH', x => x.dbh],
            ['Planted date', x => x.planted],
            ['Height', x => x.height],
            ['Maturity', x => x.maturity],
            ['Health', x => x.health],


        ]
        
    }),
    created() {
        window.Stats = this;
        console.log(sources);
        console.log(this.countries);
    },
    computed: {
        countries: () => [...(new Set(sources.map(s => s.country)))],
        sources: () => sources.sort((a, b) => a.country > b.country)
    },
    methods: {
        topTree(source) {
            return source.speciesCounts && source.speciesCounts[0] && source.speciesCounts[0][0]
            
        }
    },
}
</script>

<style scoped>
th,td {
    font-size:12px;
    text-align: left;
    padding:4px;
}
td i {
    text-align:center;
}

</style>