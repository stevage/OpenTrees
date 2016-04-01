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
  return str.toLowerCase().replace(/^w\w/, function (txt) { return txt.toUpperCase(); });
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

function mousemove(e) {
    if ($('#info').hasClass('pinned')) {
        //toggleInfo(false);
        return;
    }
    var features = map.queryRenderedFeatures(e.point, { layers: ['tree halo', 'tree greylo'] });
    var scientific = features.length ? features[0].properties.scientific : '';
    if (scientific) {
        map.setFilter("route-hover", ["==", "scientific", scientific]);
        //$('#info').text(features[0].properties.species_count + 'x ' + scientific);
    } else {
        map.setFilter("route-hover", ["==", "scientific", "$"]);
        //$('#info').text('');
    }
    if (features.length) {
        updateInfoTable(features[0].properties);
        toggleInfo(true);
        $('#wikibox').hide();
    } else {
        toggleInfo(false);
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
                "circle-opacity": 0.35
            },
            "filter": filter
        });
    $("#legend ul").append($("<li><span style='background:" + color + "'></span>" + name + "</li>"));
    layersAdded.push(name);
}

function changeDimension(e) {
    clearLayers();
    if (e.target.id === 'byspecies') {
        addFilterLayer('Gums', "hsl(90,60%,30%)", ['in','genus','Eucalyptus','Corymbia','Angophora']);
        addFilterLayer('Lophostemon (Brush box)', "hsl(115,30%,30%)", ['in','genus','Lophostemon']);
        addFilterLayer('Grevilleas, proteas, callistemons and banksias', 'hsl(120,60%,50%)', ["in", "genus", "Grevillea", 'Banksia', 'Callistemon']);
        addFilterLayer('Acacia', 'hsl(160, 90%,30%)', ["any", ["==", "genus", "Acacia"]]);
        addFilterLayer('Melaleuca', 'hsl(200, 60%,60%)', ["any", ["==", "genus", "Melaleuca"]]);
        addFilterLayer('Planes', "hsl(0,86%,60%)", ["in", "genus", "Platanus", 'Plantanus']);
        addFilterLayer('Elms',"hsl(30,60%,60%)", ["in", "genus", "Ulmus"]);
        addFilterLayer('Cedars', "hsl(50,80%,60%)",["in", "genus", "Cedrus", "Melia"]);
        addFilterLayer('Oaks', 'hsl(330, 60%,60%)', ["in", "genus", "Quercus"]);

        addFilterLayer('Pines and cypresses', "hsl(60,60%,60%)", ["in", "genus", "Pinus", "Araucaria", "Cupressus"]);
        addFilterLayer('Pears, plums and apples', 'hsl(240,60%,60%)', ["in", "genus", "Pyrus", 'Prunus', 'Malus']);
        addFilterLayer('Figs', 'hsl(0,0%,40%)', ["in", "genus", "Ficus"]);
        addFilterLayer('Ashes', 'hsl(0,0%,20%)', ["in", "genus", "Fraxinus"]);
    } else if (e.target.id === 'byrarity') {
       
       addFilterLayer('Super common', 'hsl(210, 90%,60%)', ['>=', 'species_count', 10000]);
       addFilterLayer('Very common', 'hsl(120, 90%,60%)', ['all', ['>=', 'species_count', 1000], ['<', 'species_count', 10000]]);
       addFilterLayer('Common', 'hsl(90, 60%,60%)', ['all', ['>=', 'species_count', 100], ['<', 'species_count', 1000]]);
       addFilterLayer('Average', 'hsl(60, 60%,60%)', ['all', ['>=', 'species_count', 20], ['<', 'species_count', 100]]);
       addFilterLayer('Rare', 'orange', ['all', ['>=', 'species_count', 5], ['<', 'species_count', 20]]);
       addFilterLayer('Very rare', 'red', ['<', 'species_count', 5]);
    } else if (e.target.id === 'bylocation') {
        addFilterLayer('Street', "hsl(0,60%,30%)", ['in','tree_type','Street','T-Street Tree', 'Rural roadside']);
        addFilterLayer('Park', "hsl(120,60%,30%)", ['in','tree_type','Park','T-Park Tree']);
        addFilterLayer('Plantation', "hsl(180,60%,30%)", ['in','tree_type','Plantation','Plantation rural roadside']);
        addFilterLayer('Council property', "hsl(240,60%,30%)", ['in','tree_type','Council property']);
   
    } else if (e.target.id==='bydbh') {
       addFilterLayer('>100', 'hsl(0, 90%,60%)', ['>=', 'dbh', 100]);
       addFilterLayer('10-100', 'hsl(60, 90%,60%)', ['all', ['<', 'dbh', 100], ['>', 'dbh', 10]]);
       addFilterLayer('<10', 'hsl(120, 90%,60%)', ['<=', 'dbh', 10]);
    }
 }

map.on('style.load', function() {
    map.addLayer({
            "id": "route-hover",
            "type": "circle",
            "source": "mapbox://stevage.alltrees",
            "source-layer": "alltreesgeojson",
            "layout": {},
            "paint": {
                "circle-color": "hsl(20,90%,60%)",
                "circle-opacity": 0.85
            },
            "filter": ["==", "scientific", "$"]
        });

    map.on("mousemove", mousemove);
    map.on('click', function(e) {
        if ($('#info').hasClass('pinned')) {
            $('#info').removeClass('pinned');
            mousemove(e);
            return;
        }
        var features = map.queryRenderedFeatures(e.point, { layers: ['tree halo', 'tree greylo'] });
        if (!features.length)
            return;
        var f = features[0].properties;
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
    });
    $('input').on('change', changeDimension);

});
$(function() {
    $('#info .closex').click(closeInfo);
    $('#info').on('swipeleft', closeInfo);
    $("#explore .hamburger").click(function(){ $("#explore .collapsible").toggleClass("collapsed"); });
});