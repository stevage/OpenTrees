<template lang="pug">
#map.absolute.absolute--fill
</template>

<script>
import mapboxgl from 'mapbox-gl';
import U from 'mapbox-gl-utils';
import { EventBus } from '../EventBus';

const flatten = pairs => pairs.reduce(((arr, [a, b]) => [...arr, a, b]), []);
import * as d3Color from 'd3-color';
const hues = [0, 30, 60, 90, 150, 180, 210, 250, 280, 320]
const colors = [...hues.map(h => d3Color.hcl(h,100,60).formatHex()), ...hues.map(h => d3Color.hcl(h,40,40).formatHex())];

export default {
    data: () => ({
        mode: undefined
    }),
    async mounted() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjazZzd3V2dXEwNGZlM2xtZzFnOXdkOTFtIn0.pKVxwqE61gNc7PKK5u1j6g';
        const map = new mapboxgl.Map({
            container: 'map',
            center: [144.96, -37.81],
            zoom: 14,
            style: 'mapbox://styles/stevage/ck6sws4g704uu1iqtvn25gj6v',
            // style: 'mapbox://stevage/cjxeaxkqi0i2v1cqq1qrnws8c', // satellite
            hash: 'pos',
            bearingSnap: 360,
            // dragRotate: false,
            minPitch: 0,
            maxPitch: 0,

        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new mapboxgl.NavigationControl());
        U.init(map, mapboxgl);
        window.map = map;
        window.app.Map = this;
        this.map = map;
        map.U.onLoad(() => {


            map.U.addVector('trees', window.location.hostname === 'localhost' ? 'http://localhost:4011/index.json' : 'mapbox://stevage.9slh6b3l');
            map.U.addGeoJSON('selected-tree');
            map.U.addCircle('trees-selected', 'selected-tree', {
                circleColor: 'transparent',
                // circleStrokeColor: ['case', ['to-boolean', ['feature-state', 'selected']], 'red', 'transparent'],
                circleStrokeColor: 'hsla(100,60%,40%,0.8)',
                circleStrokeWidth: 3,
                circleRadius: { stops: [[10,8], [12, 16]] },
                
                
            });
            map.U.addCircle('trees-similar', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(100,90%,60%,0.4)',
                circleRadius: { stops: [[12, 6], [17, 10]] },
                filter:false
            });
            map.U.addCircle('trees-vis-none', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(80,50%,60%,0.6)',
                circleRadius: { stops: [[10,4], [12, 6]] },
                circleOpacity:0.5
            });
            map.U.addCircle('trees-vis-species', 'trees', {
                sourceLayer: 'trees',
                circleColor: ['case', ...flatten(visGroups.species.map(([name, color, filter]) => [filter, color])), 'hsla(0,0%,0%,0.3)'],
                circleRadius: { stops: [[12, 2], [17, 6]] },
                circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-family', 'trees', {
                sourceLayer: 'trees',
                circleColor: ['case', ...flatten(visGroups.family.map(([name, color, filter]) => [filter, color])), 'hsla(0,0%,0%,0.3)'],
                circleRadius: { stops: [[12, 2], [17, 6]] },
                circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });

            map.U.addCircle('trees-vis-rarity', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[12, 2], [17, 6]] },
                circleColor: ['case', ...flatten(visGroups.rarity.map(([name, color, filter]) => [filter, color])), '#ddd'],
                circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-harm', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[12, 2], [17, 6]] },
                circleColor: ['case', ...flatten(visGroups.harm.map(([name, color, filter]) => [filter, color])), 'transparent'],
                // circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-local', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(80,50%,70%,0.9)',
                circleRadius: { stops: [[10,4], [12, 6]] },
                circleOpacity:0.9
            });
            map.U.addCircle('trees-vis-trunk', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(40,90%,20%,0.8)',
                circleRadius: ['interpolate', ['exponential', 1], ['to-number', ['get', 'dbh'], 0],
                    0, 0,
                    1, 1,
                    50, 10,
                    250, 20
                ],
                circleOpacity:0.5
            });
            map.U.addCircle('trees-inner', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(80,50%,20%,0.9)',
                circleRadius: { stops: [[10,0.5],[12,1], [14, 2]] },

                    
            });
            map.U.addSymbol('trees-vis-label', 'trees', {
                sourceLayer: 'trees',
                textField: ['coalesce', ['get', 'common'], ['get', 'scientific'], ''],
                minzoom: 16,
                textMaxWidth: 3,
                textSize: ['interpolate',['exponential', 1.5], ['zoom'],15, 8,19,10],
                textJustify: 'auto',
                textRadialOffset:0.25,
                textColor:'hsl(110,50%,15%)',
                textVariableAnchor:['left','right','bottom-left','top-left','top-right','bottom-right','bottom','top']
            });
            this.switchMode('none');
                
        });
        
        map.U.hoverPointer(['trees-inner', ...visLayers]);
        // let selectedId;
        map.U.clickOneLayer(['trees-inner', ...visLayers], e => {
            console.log(e);
            // if (selectedId) {
            //     map.setFeatureState({ source: 'trees', sourceLayer: 'trees', id: selectedId }, { selected: false });
            // }
            window.app.FeatureInfo.feature = e.features[0];
            map.U.setData('selected-tree', e.features[0]);
            map.U.setFilter('trees-similar', ['==', ['get', 'scientific'], e.features[0].properties.scientific]);
            // selectedId = e.features[0].id;
            // map.setFeatureState({ source: 'trees', sourceLayer: 'trees', id: selectedId }, { selected: true });

        }, () => {
            map.U.setData('selected-tree', {type:'FeatureCollection',features:[]})
            map.U.setFilter('trees-similar', false);
        });
        EventBus.$on('vis-mode', mode => this.$nextTick(() => this.mode = mode))
        EventBus.$on('resize', () => this.$nextTick(() => this.map.resize()));
        map.on('moveend', () => {
            if (this.mode === 'local') {
                this.updateLocal();
            }
        });
    },
    watch: {
        mode() {
            this.switchMode(this.mode);
        }
    },
    methods: {
        switchMode(mode) {
            this.map.U.hide(visLayers);
            this.map.U.show(`trees-vis-${mode}`);
            console.log(mode);
            if (['none','label'].indexOf(mode) >= 0) {
                this.map.U.setCircleOpacity('trees-inner', 1);
            } else {
                this.map.U.setCircleOpacity('trees-inner', { stops: [[14, 0], [15, 1]] });
            }
            if (mode === 'label') {
                this.map.U.show('trees-vis-none');
            }

            if (mode === 'local') {
                this.updateLocal();
                return; // it also does the legend update
            }
            EventBus.$emit('update-legend', visGroups[mode]);
        },
        updateLocal() {
            // const colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];            
            // const hues = [0, 30, 60, 90, 150, 180, 210, 250, 280, 320]
            // const colors = [...hues.map(h => d3Color.hcl(h,100,60).formatHsl()), ...hues.map(h => d3Color.hcl(h,40,40).formatHsl())];
            const localTrees = this.map.queryRenderedFeatures({ layers: ['trees-inner'] });
            const counts = {};
            const percent = x => Math.round(x * 100) / 1 + '%';
            for (const tree of localTrees) {
                if (tree.properties.scientific) {
                    let [count, common] = (counts[tree.properties.scientific] || [0, ''])
                    counts[tree.properties.scientific] = [count + 1, common || tree.properties.common]
                }
            }
            console.log(counts)
            const topVals = Object.keys(counts).sort((a, b) => counts[b][0] - counts[a][0]).slice(0,colors.length);
            visGroups.local = topVals.map((scientific, i) => [
                `${percent(counts[scientific][0] / localTrees.length)}: ${scientific}${counts[scientific][1] ? `<br/> <span class="f7">${counts[scientific][1]}</>` : ''}`, 
                colors[i], ['==', ['get', 'scientific'], 
                scientific
            ]]);
            console.log(visGroups.local);
            this.map.U.setCircleColor('trees-vis-local', ['case', ...flatten(visGroups.local.map(([name, color, filter]) => [filter, color])), 'transparent']);
            EventBus.$emit('update-legend', [...visGroups.local, ['Other', 'transparent']]);
        }
    }
}

const visGroups = {
    none: [],
    species: [
        ['Eucalyptus', "hsl(90,90%,30%)", ['in', ['get', 'genus'], ['literal', ['Eucalyptus']]]], 
        ['Corymbia,  Angophora', "hsl(90,30%,60%)", ['in', ['get', 'genus'], ['literal', ['Corymbia', 'Angophora']]]], 
        ['Lophostemon', "hsl(90,90%,60%)", ['in', ['get', 'genus'], ['literal', ['Lophostemon']]]], 
        ['Grevilleas, proteas, banksias', 'hsl(120,60%,50%)', ['in', ['get', 'genus'], ['literal', ['Grevillea', 'Grevillia', 'Banksia', 'Stenocarpus']]]], 
        ['Melaleucas and callistemons', 'hsl(200, 60%,50%)', ['in', ['get', 'genus'], ['literal', ['Melaleuca', 'Callistemon']]]], 
        ['(Allo)Casuarinas', 'hsl(180, 90%,60%)', ['in', ['get', 'genus'], ['literal', ['Casuarina', 'Allocasuarina']]]], 
        ['Other natives', 'hsl(160, 90%, 30%)', 
            ['any', 
                ['in', ['get', 'genus'], ['literal', 
                    ['Hakea', 'Agonis', 'Tristaniopsis', 'Lagunaria', 'Acacia','Hymenosporum', 'Brachychiton', 'Leptospermum' /* some aren't endemic */, 'Waterhousea' /* a bit uncertain */, 
                        'Bursaria', 'Geijera', 'Paraserianthes', 'Myoporum','Exocarpos','Exocarpus', 'Jacksonia']]],
                ['all', 
                    ['in', ['get', 'genus'], ['literal', ['Acmena', 'Syzygium']]], 
                    ['in', ['get', 'species'], ['literal', ['smithii']]]],
                ['in', ['get', 'scientific'], ['literal', ['Pittosporum undulatum', 'Cupaniopsis anacardioides', 'Acmena smithii', 'Acmena smithii (Syzygium smithii)',
                'Syzygium australe']]]]], 
        ['Planes', 'hsl(0,86%,60%)', ['in', ['get', 'genus'], ['literal', ['Platanus', 'Plantanus']]]], 
        ['Elms','hsl(30,60%,60%)', ['in', ['get', 'genus'], ['literal', ['Ulmus', 'Celtis']]]], 
        ['Oaks & maples', 'hsl(330, 60%,60%)', ['in', ['get', 'genus'], ['literal', ['Quercus', 'Acer']]]], 
        ['Palms', 'hsl(40, 100%,70%)', ['in', ['get', 'genus'], ['literal', ['Phoenix', 'Washingtonia', 'Jubaea', 'Chamaerops','Syagrus','Livistona','Trachycarpus']]]], 
        ['Conifers', 'hsl(60,90%,45%)', ['in', ['get', 'genus'], ['literal', ['Pinus', 'Araucaria', 'Cupressus', 'Cupressocyparis', 'Podocarpus', 'Platycladus', 'Thuja', 'Hesperocyparis', 
                'Callitris', 'Cedrus', 'Picea' /* spruce */, 'Abies','Cunninghamia','Chamaecyparis','Sequoiadendron', 'Sequoia','Thujopsis']]]], 
        ['Pears, plums and other fruits', 'hsl(250,60%,60%)', ['in', ['get', 'genus'], ['literal', ['Pyrus', 'Prunus', 'Malus', 'Citrus']]]], 
        ['Figs', 'hsl(0,0%,40%)', ['in', ['get', 'genus'], ['literal', ['Ficus']]]], 
        ['Ashes', 'hsl(0,0%,20%)', ['in', ['get', 'genus'], ['literal', ['Fraxinus']]]], 
        ['Other exotics', 'hsl(310, 90%,60%)', ['any', 
            ['in', ['get', 'genus'], ['literal', ['Betula', 'Liquidambar', 'Gleditsia', 'Robinia','Pseudotsuga','Alnus', 'Laburnum',
                'Eriobotrya','Olea', 'Schinus', 'Photinia', 'Laurus', 'Populus', 'Ligustrum', 'Cotoneaster', 'Nerium', 'Pyracantha', 'Zelkova', 'Jacaranda', 'Metrosideros',
                'Pistacia','Pistachia','Arbutus','Crataegus','Koelreuteria', 'Morus','Cinnamomum' /* a small number of natives */, 'Virgilia', 'Salix', 'Ceratonia', 
                'Cercis','Tilia','Ginkgo','Magnolia','Melia','Afrocarpus', 'Michelia','Sophora' /* maybe */, 'Carpinus','Fagus','Sorbus','Liriodendron','Ilex','Aesculus',
                'Viburnum', 'Genista']]], 
            ['in', ['get', 'species'], ['literal', ['indica', 'eugenioides', 'japonicus', 'japonica']]],
            ['in', ['get', 'scientific'], ['literal', ['Agathis robusta', 'Pittosporum tenuifolium', 'Agathis australis','Cordyline australis', 'Hibiscus syriacus']]]]], 
    ],
    family: [
        ['Unknown', 'hsla(0, 0%, 0%, 0.3)', ['==', ['coalesce', ['get', 'family'], ''], '']],
        ['Myrtaceae', colors[0], ['==', ['get','family'], 'Myrtaceae']],
        ['Fabaceae', colors[1], ['==', ['get','family'], 'Fabaceae']],
        ['Rosaceae', colors[2], ['==', ['get','family'], 'Rosaceae']],
        ['Casuarinaceae', colors[3], ['==', ['get','family'], 'Casuarinaceae']],
        ['Ulmaceae', colors[4], ['==', ['get','family'], 'Ulmaceae']],
        ['Proteaceae', colors[5], ['==', ['get','family'], 'Proteaceae']],
        ['Oleaceae', colors[6], ['==', ['get','family'], 'Oleaceae']],
        ['Fagaceae', colors[7], ['==', ['get','family'], 'Fagaceae']],
        ['Meliaceae', colors[8], ['==', ['get','family'], 'Meliaceae']],
        ['Pittosporaceae', colors[9], ['==', ['get','family'], 'Pittosporaceae']],
        ['Bignoniaceae', colors[10], ['==', ['get','family'], 'Bignoniaceae']],
        ['Pinaceae', colors[11], ['==', ['get','family'], 'Pinaceae']],
        ['Malvaceae', colors[12], ['==', ['get','family'], 'Malvaceae']],
        ['Anacardiaceae', colors[13], ['==', ['get','family'], 'Anacardiaceae']],
        ['Arecaceae', colors[14], ['==', ['get','family'], 'Arecaceae']],
        ['Lythraceae', colors[15], ['==', ['get','family'], 'Lythraceae']],
        ['Sapindaceae', colors[16], ['==', ['get','family'], 'Sapindaceae']],
        ['Betulaceae', colors[17], ['==', ['get','family'], 'Betulaceae']],
        ['Cupressaceae', colors[18], ['==', ['get','family'], 'Cupressaceae']],
        ['Araucariaceae', colors[19], ['==', ['get','family'], 'Araucariaceae']],
    ],

    rarity: [
        ['Unknown', 'hsla(0, 0%, 0%, 0.3)', ['==', ['to-number', ['get', 'species_count'], 0], 0]],
    ['Super common', 'hsl(210, 90%,60%)', ['>=', ['get', 'species_count'], 10000]],
    ['Very common', 'hsl(160, 90%,60%)', ['all', ['>=', ['get', 'species_count'], 1000], ['<', ['get', 'species_count'], 10000]]],
    ['Common', 'hsl(120, 80%,60%)', ['all', ['>=', ['get', 'species_count'], 100], ['<', ['get', 'species_count'], 1000]]],
    ['Average', 'hsl(60, 80%,50%)', ['all', ['>=', ['get', 'species_count'], 20], ['<', ['get', 'species_count'], 100]]],
    ['Rare', 'hsl(30, 80%, 50%)', ['all', ['>=', ['get', 'species_count'], 5], ['<', ['get', 'species_count'], 20]]],
    ['Very rare', 'hsl(0, 100%, 40%)', ['<', ['get', 'species_count'], 5]],
    ],
    harm: [

        ['Odour', 'hsl(240, 90%,60%)', ['in', ['get', 'scientific'], ['literal', ['Pyrus calleryana']]]],
        ['Allergy', 'hsl(10, 90%,60%)', ['in', ['get', 'scientific'], ['literal', ['Platanus x acerifolia', 'Platanus acerifolia']]]],
        ['Skin irritation', 'hsl(60, 90%,40%)', ['in', ['get', 'genus'], ['literal', ['Lagunaria']]]],
        ['Poisonous', 'hsl(300, 90%,50%)', ['any',
            ['in', ['get', 'genus'], ['literal', ['Nerium']]],
            ['in', ['get', 'scientific'], ['literal', ['Melia azedarach']]]]],

        ['Poisonous for dogs', 'hsl(300, 30%,40%)', ['any',
            ['in', ['get', 'scientific'], ['literal', ['Prunus serrulata', 'Cotoneaster glaucophylla']]],
            ['in', ['get', 'species'], ['literal', 'pseudoacacia']]],
            ['in', ['get', 'genus'], ['literal', ['Quercus']]]
        ],
    ],
    trunk: [],
    label: [],
    local: [] // populated dynamically
}
const visLayers = Object.keys(visGroups).map(k => `trees-vis-${k}`);
import 'mapbox-gl/dist/mapbox-gl.css';

</script>

<style scoped>
</style>