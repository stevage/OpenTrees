'use strict';
/* global mapboxgl,$,console,window*/

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJGcW03aExzIn0.QUkUmTGIO3gGt83HiRIjQw';

function toSpeciesCase(str) {
  str = str.replace(/\s+Sp[\.|p|p\.|ecies]/i, '');
  str = str.replace(/\s+Cultivar/i, '');
  str = str.replace(/\s+'.*$/g, '');
  return str.toLowerCase();
  //return str.toLowerCase().replace(/^w\w/, function (txt) { return txt.toUpperCase(); });
}


function updateInfoTable(props) {
    function val(text) {
        return text ? text.trim() : '';
    }
    function addRow(header, value, required) {
        if (value || required) {
            $("#infotable").append('<tr><th>' + header + '</th><td>' + value + '</td></tr>');
        }
    }    
    $("#treetitle").html(val(props.common) || (val(props.scientific) ? '<i>' + props.scientific + '</i>':'') || props.description || ('Tree #' + props.ref));
    $("#infotable").html('');
    var speciesCount = props.species_count ? '<small>' + props.species_count + '</small>' : '';
    addRow("Scientific name", (props.common && props.scientific)? '<i>' + props.scientific + '</i>':'');
    addRow('Maturity',props.maturity);
    addRow('Planted',props.planted);
    addRow('Diameter (DBH)',props.dbh);
    addRow('Height',props.height ? props.height : '');
    addRow('Life expectancy', props.ule_min ? props.ule_min  : '');
    addRow('Count', props.species_count ? Number(props.species_count).toLocaleString() + ' similar trees.':'');
    addRow('ID', (props.source ? props.source + ': ' : '') + val(props.ref));

}

function lookupWikipedia(searchterm) {
    var wikiapi = 'http://en.wikipedia.org/w/api.php?action=query&format=json';
    var textapi = wikiapi + '&prop=extracts&redirects&titles=';
    var imageapi = wikiapi + '&prop=pageimages&redirects&titles=';

    var wikiimg = $('<div id="wikiimg"></div>');
    if (searchterm === 'acer') {
        searchterm = 'Acer (plant)';
    }

    console.log('Searching Wikipedia for: ' + searchterm);
    $.ajax(imageapi + encodeURIComponent(searchterm), { 
        dataType: 'jsonp', 
        success: function(wikijson) {
            var pages = wikijson.query.pages;
            var page = pages[Object.keys(pages)[0]];
            if (page && page.thumbnail && page.thumbnail.source) {
                // TODO: if there is no high res image available, then the call to thumb/600px- fails. Not easy to handle
                // without making the failing call and then trying again.
                var thumb = page.thumbnail.source.replace(/\/\d\dpx-/, window.devicePixelRatio > 1 ? '/600px-' : '/300px-');
                wikiimg.html('<img src="' + thumb + '"/>');
                //wikiimg = $('<div id="#wikiimg"><img src="' + thumb + '"/></div>');

                //##RESTORE THIS$("#wikiimg").append('<p><small><a href="https://en.wikipedia.org/wiki/File:' +page.pageimage + '">Credit: Wikipedia.</a></small></p>');
            }
        }
    });
    $.ajax(textapi + encodeURIComponent(searchterm), {
        dataType: 'jsonp', 
        success: function(wikijson) {
            var pages = wikijson.query.pages;
            var page = pages[Object.keys(pages)[0]];
            $('#wikibox').show();

            if (page && page.extract) {
                $("#wikitext").html(page.extract +
                  '<p><small>Read more on <a href="http://en.wikipedia.org/wiki/' + encodeURIComponent(page.title) + '">Wikipedia</a></small></p>');
                $("#wikitext").prepend(wikiimg); // ## check to see if we have image?
                $("#wikitext").show();
            } else {
                // not found
                $("#wikiimg").html('');
                $("#wikitext").html('Nothing on <a target="_blank" href="https://en.wikipedia.org/wiki/Special:Search/' + encodeURIComponent(searchterm) + '">Wikipedia</a>.');
            }
        }
    });

}

function closeInfo() {
   $('#info').removeClass('pinned');
    $('#info').addClass('hidden');
}

function toggleInfo(show) {
    if (show) {
        $('#info').removeClass('hidden');

    } else {
        closeInfo();
    }
}


var layersAdded = [];
function clearLayers() {
    layersAdded.forEach(function(layer) {
        map.removeLayer(layer);
    });
    layersAdded=[];
    $("#legend").html("<ul></li>");
}
function addFilterLayer(name, color, filter, paintProps) {
    map.addLayer({
            "id": name,
            "type": "circle",
            "source": "mapbox://stevage.trees",
            "source-layer": "alltreesgeojson",
            "layout": {},
            "paint": {
                "circle-color": color,
                "circle-opacity": { 'stops': [[13, 0.35], [16, 0.9]], 'base': 1.5 },
                "circle-radius": { "stops": [[10, 2], [18, 10]], "base": 1.6 }
            },
            "filter": filter
        });
    if (paintProps) {
        Object.keys(paintProps).forEach(function(p) {
            map.setPaintProperty(name, p, paintProps[p]);
        });
    }
    $("#legend ul").append($("<li><span class='legend-color' style='background:" + color + "'></span><span class='legend-item'>" + name + "</span></li>"));
    layersAdded.push(name);
}
var paintProperties;
function changeDimension(e) {
    clearLayers();
    if (!paintProperties) {
        // this is properly a function, want to use whatever it's set to in Studio
        paintProperties = {
            greyloOpacity: map.getPaintProperty('tree greylo', 'circle-opacity'),
            coreColor: map.getPaintProperty('tree core', 'circle-color')
        };
    }
    map.setPaintProperty('tree greylo', 'circle-opacity', 0.01);
    map.setPaintProperty('tree core', 'circle-color', paintProperties.coreColor);
    $('#genusfilter').hide();
    $('#speciesfilter').hide();
    map.setLayoutProperty('similar-trees', 'visibility', 'none');
    if (e.target.id === 'bynone') {
        map.setPaintProperty('tree greylo', 'circle-opacity', paintProperties.greyloOpacity);
        map.setLayoutProperty('similar-trees', 'visibility', 'visible');
    } else if (e.target.id === 'byspecies') {
        addFilterLayer('Eucalyptus', "hsl(90,90%,30%)", ['in','genus','Eucalyptus']);
        addFilterLayer('Corymbia,  Angophora', "hsl(90,30%,60%)", ['in','genus','Corymbia', 'Angophora']);
        addFilterLayer('Lophostemon', "hsl(90,90%,60%)", ['in','genus','Lophostemon']);
        addFilterLayer('Grevilleas, proteas, banksias', 'hsl(120,60%,50%)', ["in", "genus", "Grevillea", 'Grevillia', 'Banksia', 'Stenocarpus']);
        addFilterLayer('Melaleucas and callistemons', 'hsl(200, 60%,50%)', ['in', 'genus', 'Melaleuca', 'Callistemon']);
        addFilterLayer('(Allo)Casuarinas', 'hsl(180, 90%,60%)', ["in", "genus", "Casuarina", 'Allocasuarina']);
        addFilterLayer('Other natives', 'hsl(160, 90%, 30%)', ['any', 
            ['in', 'genus', 'Hakea', 'Agonis', 'Tristaniopsis', 'Lagunaria', 'Acacia','Hymenosporum', 'Brachychiton', 'Leptospermum' /* some aren't endemic */, 'Waterhousea' /* a bit uncertain */, 
            'Bursaria', 'Geijera', 'Paraserianthes', 'Myoporum','Exocarpos','Exocarpus'],
            ['all', [ 'in', 'genus', 'Acmena', 'Syzygium' ], [ 'in', 'species', 'smithii'] ],
            ['in', 'scientific', 'Pittosporum undulatum', 'Cupaniopsis anacardioides', 'Acmena smithii', 'Acmena smithii (Syzygium smithii)']]);
        addFilterLayer('Planes', "hsl(0,86%,60%)", ["in", "genus", "Platanus", 'Plantanus']);
        addFilterLayer('Elms',"hsl(30,60%,60%)", ["in", "genus", "Ulmus", 'Celtis']);
        addFilterLayer('Oaks & maples', 'hsl(330, 60%,60%)', ["in", "genus", "Quercus", 'Acer']);
        addFilterLayer('Palms', 'hsl(40, 100%,70%)', ["in", "genus", "Phoenix", 'Washingtonia', 'Jubaea', 'Chamaerops','Syagrus','Livistona','Trachycarpus']);
        addFilterLayer('Conifers', "hsl(60,90%,45%)", ["in", "genus", "Pinus", "Araucaria", "Cupressus", 'Cupressocyparis', 'Podocarpus', 'Platycladus', 'Thuja', 'Hesperocyparis', 
            'Callitris', 'Cedrus', 'Picea' /* spruce */, 'Abies','Cunninghamia','Chamaecyparis','Sequoiadendron', 'Sequoia','Thujopsis']);
        addFilterLayer('Pears, plums and apples', 'hsl(250,60%,60%)', ["in", "genus", "Pyrus", 'Prunus', 'Malus']);
        addFilterLayer('Figs', 'hsl(0,0%,40%)', ["in", "genus", "Ficus"]);
        addFilterLayer('Ashes', 'hsl(0,0%,20%)', ["in", "genus", "Fraxinus"]);
        addFilterLayer('Other exotics', 'hsl(310, 90%,60%)', ['any', 
            ['in', 'genus','Betula', 'Liquidambar', 'Gleditsia', 'Robinia','Pseudotsuga','Alnus', 'Laburnum',
            'Eriobotrya','Olea', 'Schinus', 'Photinia', 'Laurus', 'Populus', 'Ligustrum', 'Cotoneaster', 'Nerium', 'Pyracantha', 'Zelkova', 'Jacaranda', 'Metrosideros',
            'Pistacia','Pistachia','Arbutus','Crataegus','Koelreuteria', 'Morus','Cinnamomum' /* a small number of natives */, 'Virgilia', 'Salix', 'Ceratonia', 
            'Cercis','Tilia','Ginkgo','Magnolia','Melia','Afrocarpus', 'Michelia','Sophora' /* maybe */, 'Carpinus','Fagus','Sorbus','Liriodendron','Ilex','Aesculus'], 
            ['in', 'species', 'indica', 'eugenioides', 'japonicus', 'japonica'],
            ['in', 'scientific', 'Agathis robusta', 'Pittosporum tenuifolium', 'Agathis australis','Cordyline australis', 'Hibiscus syriacus']]);
    } else if (e.target.id === 'byrarity') {
       
       addFilterLayer('Super common', 'hsl(210, 90%,60%)', ['>=', 'species_count', 10000]);
       addFilterLayer('Very common', 'hsl(160, 90%,60%)', ['all', ['>=', 'species_count', 1000], ['<', 'species_count', 10000]]);
       addFilterLayer('Common', 'hsl(120, 70%,60%)', ['all', ['>=', 'species_count', 100], ['<', 'species_count', 1000]]);
       addFilterLayer('Average', 'hsl(60, 70%,50%)', ['all', ['>=', 'species_count', 20], ['<', 'species_count', 100]]);
       addFilterLayer('Rare', 'hsl(30, 70%, 40%)', ['all', ['>=', 'species_count', 5], ['<', 'species_count', 20]]);
       addFilterLayer('Very rare', 'hsl(0, 100%, 40%)', ['<', 'species_count', 5]);
    } else if (e.target.id === 'bylocation') {
        addFilterLayer('Street', "hsl(0,60%,30%)", ['in','tree_type','Street','T-Street Tree', 'Rural roadside']);
        addFilterLayer('Park', "hsl(120,60%,30%)", ['in','tree_type','Park','T-Park Tree']);
        addFilterLayer('Plantation', "hsl(180,60%,30%)", ['in','tree_type','Plantation','Plantation rural roadside']);
        addFilterLayer('Council property', "hsl(240,60%,30%)", ['in','tree_type','Council property']);
   
    } else if (e.target.id==='bydbh') {
       addFilterLayer('>100', 'hsl(0, 90%,60%)', ['>=', 'dbh', 100]);
       addFilterLayer('10-100', 'hsl(60, 90%,60%)', ['all', ['<', 'dbh', 100], ['>', 'dbh', 10]]);
       addFilterLayer('<10', 'hsl(120, 90%,60%)', ['<=', 'dbh', 10]);
    } else if (e.target.id==='byevergreen') {
       addFilterLayer('Deciduous', 'hsl(0, 90%,60%)', ['==', 'evergreen', 'D']);
       addFilterLayer('Evergreen', 'hsl(110, 90%,60%)', ['==', 'evergreen', 'EV']);
       //No D_EVs in our dataset, apparently.
       //addFilterLayer('Either', 'hsl(220, 50%,60%)', ['==', 'evergreen', 'D_EV']);
    } else if (e.target.id==='bynoxious') {
       map.setPaintProperty('tree core', 'circle-color', 'hsla(128,40%,80%, 0.5)');
       var paint = { 'circle-opacity': 0.8};
       addFilterLayer('Odour', 'hsl(240, 90%,60%)', ['==', 'scientific', 'Pyrus calleryana'], paint);
       addFilterLayer('Allergy', 'hsl(10, 90%,60%)', ['==', 'scientific', 'Platanus x acerifolia'], paint);
       addFilterLayer('Skin irritation', 'hsl(60, 90%,40%)', ['in', 'genus', 'Lagunaria'], paint);
       addFilterLayer('Poisonous', 'hsl(300, 90%,50%)', ['any',
            ['in', 'genus', 'Nerium'],
            ['in', 'scientific','Melia azedarach']], paint);
       addFilterLayer('Poisonous for dogs', 'hsl(300, 30%,40%)', ['any',
            ['in', 'scientific', 'Prunus serrulata', 'Cotoneaster glaucophylla'],
            ['in', 'species','pseudoacacia'],
            ['in', 'genus','Quercus']]
            , paint);

    } else if (e.target.id==='bygenusfilter' || e.target.id==='genusfilter') {
       $('#genusfilter').show();
       addFilterLayer('Selected genus', 'hsl(120, 90%,60%)', ['==', 'genus', '$']);
       $('#genusfilter').on('input', updateGenusFilter);

       updateGenusFilter();
    } else if (e.target.id==='byspeciesfilter' || e.target.id==='speciesfilter') {
       $('#speciesfilter').show();
       addFilterLayer('Selected species', 'hsl(10, 95%,40%)', ['==', 'species', '$']);
       $('#speciesfilter').on('input', updateSpeciesFilter);

       updateSpeciesFilter();
    }
 }

 function updateGenusFilter() {
    var g = $("#genusfilter").val();
    if (g) {
       $('.legend-item').text(g);
       g = g.replace(/^./, String(g[0]).toUpperCase());
       map.setFilter('Selected genus', ['==', 'genus', g]); // Assume there is only one legend item
    }
}    

function updateSpeciesFilter() {
       var g = $("#speciesfilter").val();
       if (g) {
         map.setFilter('Selected species', ['==', 'species', g.toLowerCase()]); // Assume there is only one legend item
         $('.legend-item').text(g);
       }
}    

function setWindowHash(props, lngLat) {
    if (!props || !lngLat) return;
    window.location.hash = props.source + '-' + props.ref + '?' + 
        'lat=' + Number(lngLat.lat).toFixed(4) + '&lon=' + Number(lngLat.lng).toFixed(4);

}
var loadingSource, loadingRef;
function parseWindowHash() {
    var h = window.location.hash;
    var lon = h.match(/lon=(-?[0-9.]+)/);
    var lat = h.match(/lat=(-?[0-9.]+)/);
    loadingSource = h.match(/^#([^-]+)/);
    if (loadingSource)
        loadingSource = loadingSource[1];
    loadingRef = h.match(/^#[^-]+-(\d+)\?/);
    if (loadingRef)
        loadingRef = loadingRef[1];
    if (lon && lat) {
        var ll = new mapboxgl.LngLat(Number(lon[1]), Number(lat[1]));
        map.flyTo({center: ll, zoom: 16});
    }
}

function featureAtPixel(p) {
    var features = map.queryRenderedFeatures(p, { layers: ['tree halo', 'tree greylo'] });
    return features.length ? features[0].properties : undefined;
}

function featureBySourceAndRef(source, ref) {
    var features = map.querySourceFeatures("mapbox://stevage.trees", { 
        sourceLayer: 'alltreesgeojson', 
        filter: [ 'all', [ '==', 'source', source], [ '==', 'ref', ref ] ]
    });
    return features.length ? features[0].properties : undefined;
}

function showSimilarTrees(e, source, ref) {
    if ($('#info').hasClass('pinned')) {
        return;
    }
    var f;
    if (e && e.point) {
        f = featureAtPixel(e.point);
    } else if (source && ref) {
        f = featureBySourceAndRef(source, ref);
    }
    
    var scientific = (f && f.scientific) ? f.scientific : '$';
    if ($('#bynone').is(':checked')) {
        map.setFilter("similar-trees", ["==", "scientific", scientific]);
    }
    if (f) {
        updateInfoTable(f);
        toggleInfo(true);
        $('#wikibox').hide();
    } else {
        toggleInfo(false);
    }
}    

function showExtraTreeInfo(e, source, ref) {
    if ($('#info').hasClass('pinned')) {
        $('#info').removeClass('pinned');
        showSimilarTrees(e);
        map.setFilter("highlight-selected", ['all', ['==', 'source', '$'], ['==', 'ref', '$'] ]);
        return;
    }
    var f;
    if (e && e.point) {
        f = featureAtPixel(e.point);
    } else if (source && ref) {
        f = featureBySourceAndRef(source, ref);
    }
    if (!f)
        return;
    var searchterm;
    if (f.genus) {
        searchterm = toSpeciesCase(f.genus + (f.species ? " " + f.species : ""));
    } else if (f.common) {
        searchterm = f.common;
    } else {
        return;
    }
    $('#info').addClass('pinned');
    lookupWikipedia(searchterm);
    map.setFilter("highlight-selected", ['all', ['==', 'source', f.source], ['==', 'ref', f.ref] ]);
    setWindowHash(f, e.lngLat);
}

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/stevage/cim5qned200k59jkpf1p6l243',
    center: [144.8,-37.8], // starting position
    zoom: 9 // starting zoom
});


map.on('style.load', function() {
    map.addLayer({
            "id": "similar-trees",
            "type": "circle",
            "source": "mapbox://stevage.trees",
            "source-layer": "alltreesgeojson",
            "layout": {},
            "paint": {
                "circle-color": "hsl(20,90%,60%)",
                "circle-opacity": 0.45
            },
            "filter": ["==", "scientific", "$"]
        });
    map.addLayer({
            "id": "highlight-selected",
            "type": "circle",
            "source": "mapbox://stevage.trees",
            "source-layer": "alltreesgeojson",
            "layout": {},
            "paint": {
                "circle-color": "hsl(60,90%,70%)",
                "circle-opacity": 0.5,
                "circle-radius": 15
            },
            "filter": ['all', ['==', 'source', '$'], ['==', 'ref', '$'] ]
        }, 'tree core');

    map.on("mousemove", showSimilarTrees);
    map.on('click', showExtraTreeInfo);
    $('input').on('change', changeDimension);
});

map.on('load', function(e) {
    parseWindowHash();
});

map.on('moveend', function(e) {
    if (!e.originalEvent && loadingRef && loadingSource) {
        // hopefully this means the event was caused by our original flyTo
        showSimilarTrees(e, loadingSource, loadingRef);
        showExtraTreeInfo(e, loadingSource, loadingRef);
        loadingSource = undefined;
        loadingRef = undefined;
        console.log(e);
    }
});

var bookmarks={ 
    "Adelaide": { x: 138.6217, y: -34.9491, z: 13 },
    "Melbourne": { x: 144.95, y: -37.8, z: 11 },
    "Manningham": { x: 145.15, y: -37.77, z: 13},
    "Geelong": { x: 144.5, y: -38.15, z: 11},
    "Ballarat": { x: 143.83, y: -37.56, z: 12},
    "Colac-Otways": { x: 143.61, y: -38.4, z: 10},
    "Corangamite": { x: 143.1, y: -38.3, z: 10},
    "Waite": { x: 138.63, y: -34.97, z: 16 },
    "Wyndham": { x: 144.62, y: -37.92, z: 12 },
    "Burnside": { x: 138.65, y: -34.94, z: 13 },
    "Launceston": { x: 147.1471, y: -41.4477, z: 13 },
    "Hobsons Bay": { y: -37.8609, x: 144.8674, z: 12 },
    "Glenelg": { z: 13, y: -38.3377, x: 141.5816 }
};


$(function() {

    map.addControl(new mapboxgl.Navigation());
    map.addControl(new mapboxgl.Geolocate({position: 'top-right'}));

    $($('#map .mapboxgl-ctrl-top-right')[0].lastChild).append($(
        '<div id="mybtns" class="mapboxgl-ctrl-group">' +
        '<button class="mapbox-ctrl-icon" id="direction-btn"/>'+
        '<button class="mapbox-ctrl-icon" id="explore-btn"/>' +
        '</div>' +
        '<div id="directions" style="display:none"><ul></ul></div>'+

        '<div id="explore2" style="display:none">'+
        //'    <div class="hamburger">≡</div>'+
        '    <div class="collapsible">'+
        '        <h3>Color by:</h3>'+
        '        <form>'+
        '            <input type="radio" name="dimension" id="bynone" checked="true"/><label for="bynone">(Nothing)</label>'+
        '            <input type="radio" name="dimension" id="byspecies"/><label for="byspecies">Species group</label>'+
        // '            <input type="radio" name="dimension" id="bylocation"/><label for="bylocation">Location</label>'+
        '            <input type="radio" name="dimension" id="byrarity"/><label for="byrarity">Rarity</label>'+
        '            <input type="radio" name="dimension" id="byevergreen"/><label for="byevergreen">Evergreen/deciduous</label>'+
        '            <input type="radio" name="dimension" id="bynoxious"/><label for="bynoxious">Noxious</label>'+
        '            <input type="radio" name="dimension" id="bygenusfilter"/><label for="bygenusfilter">Genus filter</label>'+
        '            <input type="radio" name="dimension" id="byspeciesfilter"/><label for="byspeciesfilter">Species filter</label>'+
        '        </form>'+
        '        <input type="text" id="genusfilter"/>'+
        '        <input type="text" id="speciesfilter"/>'+
        '        <div id="legend"></div>'+
        '    </div>'+
        '</div>'+

        ''));
    Object.keys(bookmarks).forEach(function(bookmark) {
        var bmid = bookmark.replace(/[ -]/g, '_');
        $('#directions ul').append($('<li id="' + bmid + '">' + bookmark + '</li>'));
        $('#' + bmid).click(function() {
            var ll = new mapboxgl.LngLat(bookmarks[bookmark].x, bookmarks[bookmark].y);
            map.flyTo({center: ll, zoom: bookmarks[bookmark].z, pitch: 35});
        });
    });

    $('#direction-btn,#explore-btn').click(function(e) {
        var box = $($('#map .mapboxgl-ctrl-top-right')[0].lastChild);
        if (e.target.id === 'direction-btn' && !$('#directions').is(':visible')) {
            $('#explore2').hide();
            $('#directions').show();
            box.addClass('expanded');
        } else if (e.target.id === 'explore-btn' && !$('#explore2').is(':visible')) {
            $('#explore2').show();
            $('#directions').hide();
            box.addClass('expanded');
        } else {
            $('#explore2').hide();
            $('#directions').hide();
            box.removeClass('expanded');
        }
    });



    $('#info .closex').click(closeInfo);
    $('#info').on('swipeleft', closeInfo);
    // $("#explore .hamburger").click(function(){ $("#explore .collapsible").toggleClass("collapsed"); });
    map.off('tile.error');
});