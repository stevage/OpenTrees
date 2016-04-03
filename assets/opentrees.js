'use strict';
/* global mapboxgl,$,console,window*/

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJGcW03aExzIn0.QUkUmTGIO3gGt83HiRIjQw';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/stevage/cim5qned200k59jkpf1p6l243',
    center: [144.8,-37.8], // starting position
    zoom: 9 // starting zoom
});

map.addControl(new mapboxgl.Navigation());
map.addControl(new mapboxgl.Geolocate({position: 'top-right'}));
function toSpeciesCase(str) {
  str = str.replace(/\s+Sp./i, '');
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
    $("#treetitle").html(val(props.common) || (val(props.scientific) ? '<i>' + props.scientific + '</i>':'') || 'Tree #' + props.ref);
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
                $("#wikitext").html('Nothing on Wikipedia.');
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
function addFilterLayer(name, color, filter) {
    map.addLayer({
            "id": name,
            "type": "circle",
            "source": "mapbox://stevage.alltrees",
            "source-layer": "alltreesgeojson",
            "layout": {},
            "paint": {
                "circle-color": color,
                "circle-opacity": 0.35,
                "circle-radius": { "stops": [[10, 3], [18, 10]], "base": 1.6 }
            },
            "filter": filter
        });
    $("#legend ul").append($("<li><span class='legend-color' style='background:" + color + "'></span><span class='legend-item'>" + name + "</span></li>"));
    layersAdded.push(name);
}
var greyloOpacity;
function changeDimension(e) {
    clearLayers();
    if (!greyloOpacity) {
        // this is properly a function, want to use whatever it's set to in Studio
        greyloOpacity = map.getPaintProperty('tree greylo', 'circle-opacity');
    }
    map.setPaintProperty('tree greylo', 'circle-opacity', 0.01);
    $('#genusfilter').hide();
    $('#speciesfilter').hide();
    map.setLayoutProperty('similar-trees', 'visibility', 'none');
    if (e.target.id === 'bynone') {
        map.setPaintProperty('tree greylo', 'circle-opacity', greyloOpacity);
        map.setLayoutProperty('similar-trees', 'visibility', 'visible');
    } else if (e.target.id === 'byspecies') {
        addFilterLayer('Eucalyptus', "hsl(90,90%,30%)", ['in','genus','Eucalyptus']);
        addFilterLayer('Corymbia', "hsl(90,30%,60%)", ['in','genus','Corymbia']);
        addFilterLayer('Angophora', "hsl(90,30%,30%)", ['in','genus','Angophora']);
        addFilterLayer('Lophostemon', "hsl(90,90%,60%)", ['in','genus','Lophostemon']);
        addFilterLayer('Grevilleas, proteas, callistemons and banksias', 'hsl(120,60%,50%)', ["in", "genus", "Grevillea", 'Banksia', 'Callistemon', 'Stenocarpus']);
        addFilterLayer('Acacia', 'hsl(160, 90%,30%)', ["any", ["==", "genus", "Acacia"]]);
        addFilterLayer('Melaleuca', 'hsl(200, 60%,50%)', ["any", ["==", "genus", "Melaleuca"]]);
        addFilterLayer('(Allo)Casuarinas', 'hsl(180, 90%,60%)', ["in", "genus", "Casuarina", 'Allocasuarina']);
        addFilterLayer('Planes', "hsl(0,86%,60%)", ["in", "genus", "Platanus", 'Plantanus']);
        addFilterLayer('Elms',"hsl(30,60%,60%)", ["in", "genus", "Ulmus", 'Celtis']);
        addFilterLayer('Cedars', "hsl(50,80%,60%)",["in", "genus", "Cedrus", "Melia"]);
        addFilterLayer('Oaks', 'hsl(330, 60%,60%)', ["in", "genus", "Quercus"]);
        addFilterLayer('Maples', 'hsl(330, 30%,70%)', ["in", "genus", "Acer"]);
        addFilterLayer('Pines and cypresses', "hsl(60,60%,60%)", ["in", "genus", "Pinus", "Araucaria", "Cupressus", 'Cupressocyparis', 'Podocarpus']);
        addFilterLayer('Pears, plums and apples', 'hsl(240,60%,60%)', ["in", "genus", "Pyrus", 'Prunus', 'Malus']);
        addFilterLayer('Figs', 'hsl(0,0%,40%)', ["in", "genus", "Ficus"]);
        addFilterLayer('Ashes', 'hsl(0,0%,20%)', ["in", "genus", "Fraxinus"]);
    } else if (e.target.id === 'byrarity') {
       
       addFilterLayer('Super common', 'hsl(210, 90%,60%)', ['>=', 'species_count', 10000]);
       addFilterLayer('Very common', 'hsl(160, 90%,60%)', ['all', ['>=', 'species_count', 1000], ['<', 'species_count', 10000]]);
       addFilterLayer('Common', 'hsl(120, 70%,60%)', ['all', ['>=', 'species_count', 100], ['<', 'species_count', 1000]]);
       addFilterLayer('Average', 'hsl(60, 70%,60%)', ['all', ['>=', 'species_count', 20], ['<', 'species_count', 100]]);
       addFilterLayer('Rare', 'hsl(30, 70%, 50%)', ['all', ['>=', 'species_count', 5], ['<', 'species_count', 20]]);
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

function setWindowHash(props) {
    window.location.hash = props.source + '-' + props.ref + '?' + 
        'lat=' + props.lat + '&lon=' + props.lon;

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
        map.flyTo({center: ll, zoom: 15});
    }
}

function featureAtPixel(p) {
    var features = map.queryRenderedFeatures(p, { layers: ['tree halo', 'tree greylo'] });
    return features.length ? features[0].properties : undefined;
}

function featureBySourceAndRef(source, ref) {
    var features = map.querySourceFeatures("mapbox://stevage.alltrees", { 
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
    setWindowHash(f);
}

map.on('style.load', function() {
    map.addLayer({
            "id": "similar-trees",
            "type": "circle",
            "source": "mapbox://stevage.alltrees",
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
            "source": "mapbox://stevage.alltrees",
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

$(function() {
    $('#info .closex').click(closeInfo);
    $('#info').on('swipeleft', closeInfo);
    $("#explore .hamburger").click(function(){ $("#explore .collapsible").toggleClass("collapsed"); });
});