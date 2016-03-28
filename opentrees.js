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
    addRow('Count', props.species_count ? Number(props.species_count).toLocaleString():'');
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

});
$(function() {
    $('#info .closex').click(closeInfo);
    $('#info').on('swipeleft', closeInfo);
});