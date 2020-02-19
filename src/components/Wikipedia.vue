<template lang="pug">
#Wikipedia.pa2(v-show="searchTerm")
    div(v-if="text")
        img(:src="imageUrl")
        p(v-html="text")
        p <small>Read more on <a :href="`http://en.wikipedia.org/wiki/${encodeURIComponent(title)}`"">Wikipedia</a></small>
    div(v-else-if="loading")
        p.i Looking up Wikipedia...
    div(v-else)
        //- | Nothing on <a target="_blank" href="https://en.wikipedia.org/wiki/Special:Search/' + encodeURIComponent(this.searchTerm) + '">Wikipedia</a>.';
        p Nothing found on Wikipedia.
</template>

<script>
import axios from 'axios';
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
    watch: {
        searchTerm() {
            this.text = undefined;
            this.title = undefined;
            this.imageUrl = undefined;
            this.loading = true;
            const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';
            var wikiapi = corsAnywhere + 'http://en.wikipedia.org/w/api.php?action=query&format=json';
            var textapi = wikiapi + '&prop=extracts&redirects&titles=';
            var imageapi = wikiapi + '&prop=pageimages&redirects&titles=';

            // Bring this back - concerned about reactive cascades
            // if (this.searchTerm === 'acer') {
            //     this.searchTerm = 'Acer (plant)';
            // }

            console.log('Searching Wikipedia for: ' + this.searchTerm);
            
            axios.get(imageapi + encodeURIComponent(this.searchTerm)).then(response => {
                const pages = response.data.query.pages;
                const page = pages[Object.keys(pages)[0]];
                if (page && page.thumbnail && page.thumbnail.source) {
                    // TODO: if there is no high res image available, then the call to thumb/600px- fails. Not easy to handle
                    // without making the failing call and then trying again.
                    const thumb = page.thumbnail.source.replace(/\/\d\dpx-/, window.devicePixelRatio > 1 ? '/600px-' : '/300px-');
                    this.imageUrl = thumb;
                    //##RESTORE THIS$("#wikiimg").append('<p><small><a href="https://en.wikipedia.org/wiki/File:' +page.pageimage + '">Credit: Wikipedia.</a></small></p>');
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
    }
}


</script>

<style>
#Wikipedia h2 { font-size: 16px; margin-bottom:0;padding:0;}
#Wikipedia p { margin-top:0; }
</style>