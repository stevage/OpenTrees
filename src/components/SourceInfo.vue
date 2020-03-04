<template lang="pug">
#SourceInfo(v-if="source")
    .panel 
        div.bg-green.pa2
            h2.lancelot.f3.mv0.bg-green {{ p.long || p.short || p.id }}
            .dark-gray.f6 {{ p.country }}
        .ma2
            h3 Accessing data:
            p(v-if="p.info") 
                a(:href="p.info" target="_blank") Information about the dataset.

            p
                a(:href="p.download" target="_blank") Download the raw data.
            h3 Fields included:
            table
                tr
                    td.f4.pv2.pr4.tc.bg-light-green(colspan="2") Taxonomy
                tr
                    th Scientific name
                    td {{ hasField('scientific') }}
                tr
                    th Common name
                    td {{ hasField('common') }}
                tr
                    th Genus
                    td {{ hasField('Genus') }}
                tr
                    th Species
                    td {{ hasField('Species') }}
                tr
                    th Variety
                    td {{ hasField('Variety') }}
                tr
                    th Family
                    td {{ hasField('family') }}
                tr
                    td.f4.pv2.pr4.tc.bg-light-green(colspan="2") Physical
                tr
                    th Diameter (DBH)
                    td {{ hasField('dbh') }}
                tr
                    th Health
                    td {{ hasField('health') }}
                tr
                    th Structure
                    td {{ hasField('Structure') }}
                tr
                    th Maturity
                    td {{ hasField('maturity') }}
                tr
                    th Height
                    td {{ hasField('height') }}
                tr
                    th Crown width
                    td {{ hasField('crown') }}
                tr
                    th Location
                    td {{ hasField('Location') }}
                tr
                    td.f4.pv2.pr4.tc.bg-light-green(colspan="2") Dates
                tr
                    th Planted date
                    td {{ hasField('planted') }}
                tr
                    th Updated date
                    td {{ hasField('Updated') }}
                tr
                    th Useful life expectancy
                    td {{ hasField('ule') }}
                tr
                    td.f4.pv2.pr4.tc.bg-light-green(colspan="2") Metadata
                tr
                    th Description
                    td {{ hasField('Description') }}
                tr
                    th Note
                    td {{ hasField('Note') }}
                tr
                    th Reference ID
                    td {{ hasField('ref') }}

</template>

<script>
import sources from '../sources-out.json';
import { EventBus } from '../EventBus';
export default {
    name: "SourceInfo",
    data: () => ({
        source: undefined
    }),
    computed: {
        p() {
            return this.source ;
        }
    },
    created() {
        window.SourceInfo = this;
        EventBus.$on('source-select', sourceId => {
            this.source = sources.find(s => s.id === sourceId);
            console.log(sourceId, this.source);
        });
        EventBus.$on('tree-select', () => this.source = null);
    },
    methods: {
        hasField(fieldName) {
            return this.source.crosswalk[fieldName.toLowerCase()] ? 'Yes' : '-'
            
        }
    },
}
</script>

<style scoped>
.panel {
    width:300px;
}
th {
    text-align: right;
}

</style>