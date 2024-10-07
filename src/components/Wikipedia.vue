<template lang="pug">
#Wikipedia.pa2(v-show="searchTerm")
    div(v-if="text")
        img(:src="imageUrl")
        p(v-html="text")
        p <small>Read more on <a target="_blank" :href="wikiLink"">Wikipedia</a></small>
    div(v-else-if="loading")
        p.i Looking up Wikipedia...
    div(v-else)
        //- | Nothing on <a target="_blank" href="https://en.wikipedia.org/wiki/Special:Search/' + encodeURIComponent(this.searchTerm) + '">Wikipedia</a>.';
        p Nothing found on <a target="_blank" :href="wikiSearchLink">Wikipedia</a>.
</template>

<script>
import axios from 'axios';
const wikiapi =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*';
const textapi = wikiapi + '&prop=extracts&redirects&titles=';
const imageapi = wikiapi + '&prop=pageimages&redirects&titles=';

export default {
    name: "Wikipedia",
    data: () => ({
        imageUrl: undefined,
        text:undefined,
        title: undefined,
        loading: false
    }),
    props: ['searchTerm'],
    created() {
        window.Wikipedia = this;
    },
    mounted () {
        this.doSearch();
    },
    computed: {
        wikiLink() {
            return `http://en.wikipedia.org/wiki/${encodeURIComponent(this.title)}`;
        },
        wikiSearchLink() {
            return `https://en.wikipedia.org/w/index.php?search=${this.searchTerm}`;
            // return `http://en.wikipedia.org/wiki/${encodeURIComponent(this.searchTerm)}`;
            
        }
    },
    methods: {
        doSearch() {
            this.text = undefined;
            this.title = undefined;
            this.imageUrl = undefined;
            this.loading = true;

            // Bring this back - concerned about reactive cascades
            // if (this.searchTerm === 'acer') {
            //     this.searchTerm = 'Acer (plant)';
            // }
            if (!this.searchTerm) {
                return;
            }
            console.log('Searching Wikipedia for: ' + this.searchTerm);
            
            axios.get(imageapi + encodeURIComponent(this.searchTerm)).then(response => {
                const pages = response.data.query.pages;
                const page = pages[Object.keys(pages)[0]];
                if (page && page.thumbnail && page.thumbnail.source) {
                    // TODO: if there is no high res image available, then the call to thumb/600px- fails. Not easy to handle
                    // without making the failing call and then trying again.
                    const thumb = page.thumbnail.source.replace(/\/\d\dpx-/, window.devicePixelRatio > 1 ? '/600px-' : '/300px-');
                    this.imageUrl = thumb;
                }
            });
            
            axios.get(textapi + encodeURIComponent(this.searchTerm)).then(response => {
                this.loading = false;
                const pages = response.data.query.pages;
                const page = pages[Object.keys(pages)[0]];

                if (page && page.extract) {
                    this.title = page.title;
                    this.text = page.extract
                } else {
                    this.imageUrl = undefined;
                    this.text = undefined;
                }
            });
        }
    },
    watch: {
        searchTerm() {
            this.doSearch();
        }
            
    }
}


</script>

<style>
#Wikipedia h2 { font-size: 16px; margin-bottom:0;padding:0;}
#Wikipedia p { margin-top:0; }
</style>