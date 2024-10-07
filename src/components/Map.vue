<template lang="pug">
#map.absolute.absolute--fill
</template>

<script>
import mapboxgl from 'mapbox-gl';
import U from 'mapbox-gl-utils';
import { EventBus } from '../EventBus';
import sources from '../sources';
console.log(sources);

const flatten = pairs => pairs.reduce(((arr, [a, b]) => [...arr, a, b]), []);
import * as d3Color from 'd3-color';
const hues = [0, 30, 60, 90, 150, 180, 210, 250, 280, 320]
const colors = [...hues.map(h => d3Color.hcl(h,100,60).formatHex()), ...hues.map(h => d3Color.hcl(h,40,40).formatHex())];

export default {
    data: () => ({
        mode: undefined
    }),
    async mounted() {
        if (window.location.hostname === 'localhost' || window.location.hash.match(/clear/)) {
            mapboxgl.clearStorage();
        }
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjazZzd3V2dXEwNGZlM2xtZzFnOXdkOTFtIn0.pKVxwqE61gNc7PKK5u1j6g';
        const map = new mapboxgl.Map({
            container: 'map',
            center: [144.96, -37.81],
            zoom: 1,

            style: !window.location.hash.match(/nomap/) ? 'mapbox://styles/stevage/ck6sws4g704uu1iqtvn25gj6v/draft?v=1'
                : { version: 8, sources: {}, layers: [], 
                    glyphs: `${window.location.origin}/font-glyphs/{fontstack}/{range}.pbf`
                },
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
        map.U.loadImage('tree', 'cubetree-favicon.png');
        map.U.onLoad(() => {
            console.log('this one', sources[0]);
            map.U.addGeoJSON('sources', {
                type: 'FeatureCollection',
                features: sources
                .filter(source => (source.centre || source.bounds) && !source.primary)
                .map(source => ({
                    type: 'Feature',
                    properties: {
                        ...source,
                        topTree: (source.speciesCounts && source.speciesCounts.length ? source.speciesCounts[0][0] : '')
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: source.centre || [(source.bounds[0] + source.bounds[2]) / 2, (source.bounds[1] + source.bounds[3]) / 2]
                    }
                }))
            });

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
                circleColor:'transparent',
                circleStrokeWidth:1,
                circleStrokeColor: 'hsla(100,50%,60%,0.8)',
                circleRadius: { stops: [[12, 6], [17, 10]] },
                filter:false
            });
            map.U.addCircle('trees-vis-none', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(80,50%,60%,0.6)',
                circleRadius: { stops: [[10,4], [12, 6], [16, 8], [20, 18]] },
                circleOpacity:0.5
            });
            for (const submode of ['1', '2']) {
                map.U.addCircle(`trees-vis-species${submode}`, 'trees', {
                    sourceLayer: 'trees',
                    circleColor: ['case', ...stops(`species${submode}`), 'hsla(0,0%,0%,0.3)'],
                    circleRadius: { stops: [[10, 1], [12, 2], [17, 6], [ 20, 18], ] },
                    circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
                });
            }
            map.U.addCircle('trees-vis-family', 'trees', {
                sourceLayer: 'trees',
                circleColor: ['case', ...stops('family'), 'hsla(0,0%,0%,0.3)'],
                circleRadius: { stops: [[12, 2], [17, 6]] },
                circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });

            map.U.addCircle('trees-vis-rarity', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[12, 2], [17, 6], [20, 18]] },
                // circleColor: ['case', ...flatten(visGroups.rarity.map(([name, color, filter]) => [filter, color])), '#ddd'],
                circleColor: ['interpolate', ['linear'], ['to-number', ['get', 'species_count']], 
                    ...flatten(visGroups.rarity.reverse().map(([name, color, number]) => [number, color])),
                     ],
                // circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1],
                circleSortKey: ['-', ['get', 'species_count']]
            });
            map.U.addCircle('trees-vis-health', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[10, 1], [12, 2], [17, 6], [20, 18]] },
                circleColor: ['match', ['coalesce', ['get', 'health'], ''], ...stops('health'), 'hsla(260,80%,50%,0.7)'],
                // circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-maturity', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[10, 1], [12, 2], [17, 6], [20, 18]] },
                circleColor: ['match', ['coalesce', ['get', 'maturity'], ''], ...stops('maturity'), 'hsla(260,80%,50%,0.7)'],
                // circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-edible', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[10, 1], [12, 2], [17, 6], [20, 18]] },
                circleColor: ['case', ...stops('edible'), 'transparent',/*'hsla(100,80%,20%,0.02)'*/],
                // circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-harm', 'trees', {
                sourceLayer: 'trees',
                circleRadius: { stops: [[12, 2], [17, 6],[20, 18]] },
                circleColor: ['case', ...stops('harm'), 'transparent'],
                // circleOpacity:['interpolate', ['linear'], ['zoom'], 13, 0.5, 17, 1]
            });
            map.U.addCircle('trees-vis-local', 'trees', {
                sourceLayer: 'trees',
                circleColor: 'hsla(80,50%,70%,0.9)',
                circleRadius: { stops: [[10,2], [12, 3],[16,5], [20, 14]] },
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
                circleRadius: { stops: [[9,0.5],[11,1], [14, 2]] },

                    
            });
            map.U.addSymbol('trees-vis-label', 'trees', {
                sourceLayer: 'trees',
                textField: ['coalesce', ['get', 'common'], ['get', 'scientific'], ''],
                minzoom: 16,
                textMaxWidth: 3,
                textSize: ['interpolate',['exponential', 1.5], ['zoom'],15, 8,19,10],
                textJustify: 'auto',
                textRadialOffset:0.2,
                textColor:'hsl(110,50%,15%)',
                textVariableAnchor:['left','right','bottom-left','top-left','top-right','bottom-right','bottom','top']
            });

            map.U.addSymbol('sources-icons', 'sources', {
                iconImage: 'tree',
                iconSize:['interpolate',['linear'],['zoom'], 1,0.1, 5, 0.3],
                iconAllowOverlap: true,
                // circleColor:'hsl(100,30%,30%)',
                // circleRadius:['interpolate', ['linear'], ['zoom'], 3, 5, 5, 10],
                // circleStrokeWidth:3,
                // circleStrokeColor:'hsl(100,30%,50%)',
                // circleOpacity: ['interpolate',['linear'],['zoom'],5,1,7,0],
                maxzoom: 10,
                visibility: window.location.hash.match('noicons') ? 'none' : 'visible'
            });
            // map.U.addCircle('sources-circles', 'sources', {e
            //     circleColor:'hsl(100,30%,30%)',
            //     circleRadius:['interpolate', ['linear'], ['zoom'], 3, 5, 5, 10],
            //     circleStrokeWidth:3,
            //     circleStrokeColor:'hsl(100,30%,50%)',
            //     circleOpacity: ['interpolate',['linear'],['zoom'],5,1,7,0],
            //     maxzoom: 8
            // });
            map.U.clickLayer('sources-icons', ({ features }) => {
                EventBus.$emit('source-select', features[0].properties.id);
                console.log(features[0].geometry)
                map.flyTo({
                    center: features[0].geometry.coordinates,
                    zoom: 11
                });
                
            });
            const sourceLabelProps = {
                textField: ['coalesce', ['get','short'], ['get','id']],
                // textField: ['coalesce', ['get','topTree'],''],
                textMaxWidth: 5,
                textLineHeight:1,

                textHaloColor: 'hsla(100,30%,95%,0.9)',
                textColor:'hsl(100,30%,10%)',
                textHaloWidth: 2,
                textFont: ['Lancelot Regular','Arial Unicode MS Regular'],
                visibility: window.location.hash.match('noicons') ? 'none' : 'visible'
            };

            map.U.addSymbol('sources-labels', 'sources', {
                ...sourceLabelProps,
                textAllowOverlap: true,
                maxzoom:10,  
                minzoom: 8,
            });

            map.U.addSymbol('sources-labels-low', 'sources', {
                ...sourceLabelProps,
                textVariableAnchor:['center','bottom','left','bottom-left','top-left','right','top-right','bottom-right',],
                textRadialOffset: 1,
                textAllowOverlap: false,
                maxzoom:8,  
                minzoom: 4,
            });

            this.switchMode('none');
            map.on('zoom', () => EventBus.$emit('zoom-change', map.getZoom()));
                
        });
        
        map.U.hoverPointer(['trees-inner', ...visLayers]);
        // let selectedId;
        map.U.clickOneLayer(['trees-inner', ...visLayers], e => {
            if (map.getZoom() < 7) {
                return;
            }
            console.log(e);
            // if (selectedId) {
            //     map.setFeatureState({ source: 'trees', sourceLayer: 'trees', id: selectedId }, { selected: false });
            // }
            const f = e.features[0];
            EventBus.$emit('tree-select', f);
            map.U.setData('selected-tree', f);
            map.U.setFilter('trees-similar', f.properties.scientific ? ['==', ['get', 'scientific'], f.properties.scientific] : false);
            // selectedId = e.features[0].id;
            // map.setFeatureState({ source: 'trees', sourceLayer: 'trees', id: selectedId }, { selected: true });

        }, () => {
            map.U.setData('selected-tree', {type:'FeatureCollection',features:[]})
            map.U.setFilter('trees-similar', false);
            EventBus.$emit('unselect-tree');
        });
        EventBus.$on('vis-mode', mode => this.$nextTick(() => this.mode = mode))
        EventBus.$on('resize', () => this.$nextTick(() => this.map.resize()));
        EventBus.$on('species-filter', (filter) =>
            map.U.setFilter(
                [...visLayers, 'trees-inner'],
                filter
                    ? [
                          'any',
                          ['in', filter, ['get', 'scientific']],
                          ['in', filter, ['get', 'genus']],
                          ['in', filter, ['get', 'common']],
                      ]
                    : true
            )
        );
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
                this.map.U.setCircleRadius('trees-inner', { stops: [[9,1],[14, 2]] });

            } else {
                this.map.U.setCircleOpacity('trees-inner', { stops: [[14, 0], [15, 1]] });
                this.map.U.setCircleRadius('trees-inner', { stops: [[9,0.5],[11,1], [14, 2]] });

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
            if (this.map.getZoom() < 12) {
                this.map.U.setCircleColor('trees-vis-local', 'green');
                return;
            }

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
            this.map.U.setCircleColor('trees-vis-local', visGroups.local.length ? ['case', ...stops('local'), 'transparent'] : 'transparent');
            EventBus.$emit('update-legend', [...visGroups.local, ['Other', 'transparent']]);
        }
    }
}
const stops = visType => flatten(visGroups[visType].map(([name, color, stop]) => [stop, color]));
const COMMONSCALE = 10;
const visGroups = {
    none: [],
    species1: [
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
                        'Bursaria', 'Geijera', 'Paraserianthes', 'Myoporum','Exocarpos','Exocarpus', 'Jacksonia',
                        'Agathis' /* well only Robusta, atropurpurea, microstachya */]]],
                ['all', 
                    ['in', ['get', 'genus'], ['literal', ['Acmena', 'Syzygium']]], 
                    ['in', ['get', 'species'], ['literal', ['smithii']]]],
                ['in', ['get', 'scientific'], ['literal', [
                    'Pittosporum undulatum', 
                    'Cupaniopsis anacardioides', 
                    'Acmena smithii', 
                    'Acmena smithii (Syzygium smithii)',
                    'Melia azedarach',
                    'Syzygium australe']]]]], 
        ['Planes', 'hsl(0,86%,60%)', ['in', ['get', 'genus'], ['literal', ['Platanus', 'Plantanus']]]], 
        ['Elms','hsl(30,60%,60%)', ['in', ['get', 'genus'], ['literal', ['Ulmus', 'Celtis']]]], 
        ['Oaks & maples', 'hsl(345, 60%,30%)', ['in', ['get', 'genus'], ['literal', ['Quercus', 'Acer']]]], 
        ['Palms', 'hsl(40, 100%,70%)', ['in', ['get', 'genus'], ['literal', ['Phoenix', 'Washingtonia', 'Jubaea', 'Chamaerops','Syagrus','Livistona','Trachycarpus']]]], 
        ['Conifers', 'hsl(60,90%,45%)', ['in', ['get', 'genus'], ['literal', ['Pinus', 'Araucaria', 'Cupressus', 'Cupressocyparis', 'Podocarpus', 'Platycladus', 'Thuja', 'Hesperocyparis', 
                'Callitris', 'Cedrus', 'Picea' /* spruce */, 'Abies','Cunninghamia','Chamaecyparis','Sequoiadendron', 'Sequoia','Thujopsis','Taxus', 'Lepidopthamnus',]]]], 
        ['Pears, plums and other fruits', 'hsl(250,60%,60%)', ['in', ['get', 'genus'], ['literal', ['Pyrus', 'Prunus', 'Malus', 'Citrus', 'Mangifera']]]], 
        ['Figs, olives', 'hsl(0,0%,40%)', ['in', ['get', 'genus'], ['literal', ['Ficus', 'Olea']]]], 
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
    species2: [
        ['Gum', "hsl(90,90%,30%)", ['in', ['get', 'genus'], ['literal', ['Eucalyptus', 'Corymbia', 'Angophora', 'Lophostemon']]]], 
        ['Maple', "hsl(40,90%,30%)", ['in', ['get', 'genus'], ['literal', ['Acer']]]], 
        ['Oak', "hsl(60,70%,40%)", ['in', ['get', 'genus'], ['literal', ['Quercus']]]], 
        ['Plane', "hsl(0,90%,60%)", ['in', ['get', 'genus'], ['literal', ['Platanus']]]], 
        ['Locust', "hsl(30,100%,60%)", ['in', ['get', 'genus'], ['literal', ['Gleditsia']]]], 
        ['Linden', "hsl(120,80%,60%)", ['in', ['get', 'genus'], ['literal', ['Tilia']]]], 
        ['Ash', "hsl(140,70%,60%)", ['in', ['get', 'genus'], ['literal', ['Fraxinus']]]], 
        ['Conifer', "hsl(210,70%,60%)", ['in', ['get', 'genus'], ['literal', ['Pinus', 'Araucaria', 'Cupressus', 'Cupressocyparis', 'Podocarpus', 'Platycladus', 'Thuja', 'Hesperocyparis', 
                'Callitris', 'Cedrus', 'Picea', 'Abies','Cunninghamia','Chamaecyparis','Sequoiadendron', 'Sequoia','Thujopsis','Taxus', 'Lepidopthamnus',]]]],
        ['Palms', 'hsl(240, 50%,40%)', ['in', ['get', 'genus'], ['literal', ['Phoenix', 'Washingtonia', 'Jubaea', 'Chamaerops','Syagrus','Livistona','Trachycarpus']]]], 
        ['Chestnut', "hsl(240,30%,60%)", ['in', ['get', 'genus'], ['literal', ['Aesculus']]]], 
        ['Elm', "hsl(0,30%,60%)", ['in', ['get', 'genus'], ['literal', ['Ulmus']]]], 
        ['Plums', "hsl(260,70%,60%)", ['in', ['get', 'genus'], ['literal', ['Prunus']]]], 
        // ['', "hsl(90,30%,60%)", ['in', ['get', 'genus'], ['literal', ['']]]], 
        // ['', "hsl(90,30%,60%)", ['in', ['get', 'genus'], ['literal', ['']]]], 
        ['East Asian exotics', "hsl(310,80%,30%)", ['in', ['get', 'genus'], ['literal', ['Ginkgo','Koelreuteria','Zelkova','Styphnolobium','Cercidiphyllum']]]], 
        ['', "hsl(90,30%,60%)", ['in', ['get', 'genus'], ['literal', ['']]]], 
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
        // these were: 1, 5, 20, 100, 1000, 10000
        ['Super common', 'hsla(210, 90%,60%, 0.5)', 300e3],
        ['Very common', 'hsla(160, 90%,60%, 0.6)', 20e3],
        ['Common', 'hsla(120, 80%,60%, 0.7)', 2000],
        ['Average', 'hsla(60, 80%,50%, 0.8)', 100],
        ['Rare', 'hsla(30, 80%, 50%, 0.9)', 12],
        ['Very rare', 'hsla(0, 100%, 40%, 1)', 1],
        ['Unknown', 'hsla(0, 0%, 0%, 0.3)', 0],

    ],
    health: [
        ['Excellent', 'hsla(170, 100%,50%, 0.8)', [ 'Very Good','Excellent', 'excellent', '90','95','100', 'VERY GOOD','EXCELLENT','EXCL']],
        ['Good', 'hsla(130, 80%,50%, 0.8)', ['Good',  'good', 'High vigour', '80','83', '85','VIVANT','GOOD',]],
        ['Fair', 'hsla(70, 80%, 40%, 0.9)', ['Fair','fair', 'Medium vigour','60','68', '70','Alive','FAIR',]], // seriously where does "alive" go?
        ['Poor', 'hsla(30, 80%, 50%, 1)', ['Poor','poor', 'Low vigour', 'Dead wood', '40', '50','53','POOR']],
        ['Very poor', 'hsla(0, 100%, 30%, 1)', ['Very Poor', 'Dying','dying', 'Dying tree',  '20', '25','30',  'Critical', 'VERY POOR']],
        ['Dead', 'hsla(330, 30%,10%, 0.9)', ['Dead','dead','Stump','stump', '0', '10', 'SOUCHE' /* stump*/, 'DEAD']],
        ['N/A', 'hsla(0,0%,50%,0.5)', ['','N/A',' ','Unassigned','Unknown','NA','Very']],
        ['Other', 'hsla(260,80%,50%,0.7)', ['Other']],
    ],
    maturity: [

        // no idea about Paris' single letter codes really
        ['Over-mature', 'hsla(0, 80%,50%, 0.8)', ['Over-mature','Over-Mature','Over Mature','On Maintenance', 'Senescent','Scenescent','Decline','M','Arbre vieillissant','sénescent','vieux','Veteran']],
        ['Mature', 'hsla(40, 100%, 50%, 0.9)', ['Mature','A','Arbre adulte','adulte','Adulte','Fully Mature','Volwassen']],
        ['Semi-mature', 'hsla(100, 50%, 50%, 0.9)', ['Semi-mature','Semi-Mature','Semi mature','Early-Mature','JA','Young Mature','Middle Aged','Halfwas']],
        // where does "Vigorous" go?
        ['Young', 'hsla(160, 90%, 50%, 1)', ['Young','Juvenile','J','Arbre jeune','jeune','Jeune','Immature','Jong']],
        ['New', 'hsla(220, 100%, 50%, 1)', ['New','New Planting','Newly Planted']],
        // ['Very poor', 'hsla(0, 100%, 30%, 1)', ['Very Poor', 'Dying','dying', 'Dying tree',  '20', '30',  'Critical']],
        // ['Dead', 'hsla(330, 30%,10%, 0.9)', ['Dead','dead','Stump','stump', '0', '10', 'SOUCHE' /* stump*/]],
        ['N/A', 'hsla(0,0%,50%,0.5)', ['','N/A','Not Specified']],
        ['Other', 'hsla(260,80%,50%,0.7)', ['Other']],
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
    edible: [
        ['Apple/crabapple', 'hsl(0,80%,30%)', ['==', ['get', 'genus'], 'Malus']],
        ['Cherry plum', 'hsl(280,80%,30%)', ['all', ['==', ['get', 'genus'], 'Prunus'], ['==', ['get', 'species'], 'cerasifera']]],
        ['Peach', 'hsl(30,100%,60%)', ['all', ['==', ['get', 'genus'], 'Prunus'], ['==', ['get', 'species'], 'persica']]],
        ['Cherry', 'hsl(330,80%,30%)', ['all', ['==', ['get', 'genus'], 'Prunus'], ['==', ['get', 'species'], 'avium']]], // cerasus...
        // ['Stone fruit', 'blue', ['==', ['get', 'genus'], 'Prunus']],
        ['Citrus', 'yellow', ['==',['get', 'genus'], 'Citrus']],
        ['Mango','hsl(50,80%,40%)', ['==',['get','genus'], 'Mangifera']],
        ['Fig', 'hsl(100,90%,40%)', ['all', ['==', ['get', 'genus'], 'Ficus'], ['==', ['get', 'species'], 'carica']]], // maybe others too
        ['Quandong', 'hsl(340,95%,46%)', ['all', ['==', ['get', 'genus'], 'Santalum'], ['==', ['get', 'species'], 'acuminatum']]], 
        ['Loquat', 'hsl(150,95%,46%)', ['all', ['==', ['get', 'genus'], 'Eriobotrya'], ['==', ['get', 'species'], 'japonica']]], 

        

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