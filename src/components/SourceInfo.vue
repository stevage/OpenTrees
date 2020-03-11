<template lang="pug">
#SourceInfo(v-if="source")
    .panel 
        div.bg-green.pa2
            h2.lancelot.f3.mv0.bg-green {{ p.long || p.short || p.id }}
            .dark-gray.f6 {{ p.country }}
            i.close-btn.pa2.mt1.dark-green.pointer.fw6.fas.fa-times(@click="close" style="position:absolute;right:0;top:0; cursor:pointer;")

        .ma2
            h3 Accessing data:
            p(v-if="p.info") Data provided by 
                a(:href="p.info" target="_blank") {{ p.long || p.short || p.id }}
                | .
            p(v-else) Data provided by {{ p.long || p.short || p.id }}
            p(v-if="licenseUrl") License: 
                a(:href="licenseUrl" target="_blank") {{ p.license }}

            p
                a(:href="p.download" target="_blank") Download the raw data.
            div(v-if="p.speciesCounts && p.speciesCounts.length > 0")
                h3 Top species
                table
                    tr(v-for="([species, count]) of p.speciesCounts || []")
                        th.tl {{ species }}
                        td {{ count.toLocaleString() }}
                        td.light-green {{ Math.round(100 * count / p.keepCount) }}%
            h3 Fields included:
            table.fields
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
            h3 Import
            table
                tr  
                    th Rows imported
                    td {{ p.keepCount.toLocaleString() }}
                tr
                    th Rows rejected as "vacant"
                    td {{ p.delCount.toLocaleString() }}
                tr
                    th Rows missing geometry
                    td {{ p.noGeomCount.toLocaleString() }}

</template>

<script>
import sources from '../sources';
import { EventBus } from '../EventBus';
export default {
    name: "SourceInfo",
    data: () => ({
        source: undefined
    }),
    computed: {
        p() {
            return this.source ;
        },
        licenseUrl() {
            if (this.p.license) {
                if (this.p.license.match(/^http/)) {
                    return this.p.license;
                } else {
                    return `https://spdx.org/licenses/${this.p.license}`;
                }
            }
            return undefined;
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
            
        },
        close() {
            this.about = false;
        },
    },
}
</script>

<style scoped>
.panel {
    width:300px;
}
.fields th {
    text-align: right;
}

</style>