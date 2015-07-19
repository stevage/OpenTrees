function toSpeciesCase(str) {
  str = str.replace(/\s+Sp./i, '');
  str = str.replace(/\s+Cultivar/i, '');
  str = str.replace(/\s+'.*$/g, '');
  return str.toLowerCase().replace(/^w\w/, function (txt) { return txt.toUpperCase(); });
}

var hasBookmark=false;

function bookmark(bm) {
  bookmarks={ 
    "adelaide": { x: 138.6217, y: -34.9491, z: 13 },
    "melbourne": { x: 144.95, y: -37.8, z: 11 },
    "manningham": { x: 145.15, y: -37.77, z: 13},
    "geelong": { x: 144.5, y: -38.15, z: 11},
    "ballarat": { x: 143.83, y: -37.56, z: 12},
    "colac-otways": { x: 143.61, y: -38.4, z: 10},
    "corangamite": { x: 143.1, y: -38.3, z: 10},
    "waite": { x: 138.63, y: -34.97, z: 16 },
    "wyndham": { x: 144.62, y: -37.92, z: 12 },
    "burnside": { x: 138.65, y: -34.94, z: 13 }
  };
  if (b = bookmarks[bm]) {
    map.setView(L.latLng(b.y,b.x), b.z);
    hasBookmark=true;
  }
}
function doBookmarks() {
    var matches = window.location.href.match(/#([a-z_-]+-[0-9]+)/);
    if (matches) {
      $.getJSON('http://www.opentrees.org:3000/trees?uniqueref=eq.' + matches[1], function(j) {
        // sometimes unique references aren't unique (eg, manningham-20171)
        j.forEach(function(tree) {
          var text = '<h2>' + tree.uniqueref + '</h2>' + 
          tree.genus + ' ' + tree.species

          map.setView(L.latLng(tree.lat,tree.lon), 16);
          var icon = L.MakiMarkers.icon({icon: "park2", color: "#5c2", size: "l"});

          L.marker([tree.lat, tree.lon], {icon: icon, opacity:0.8}).addTo(map)
          .bindPopup(text)
          .openPopup();
          clickGrid({data: tree});
          hasBookmark=true;
        });
      });
      return;
    }


    matches = window.location.href.match(/#([a-zA-Z0-9_-]+)/);
    if (matches) {
      bookmark(matches[1]);
      return;
    }
    // 
  
}
var hereMarker;
function onLocationFound(e) {

  var icon = L.MakiMarkers.icon({icon: "star", color: "#cc2", size: "m"});
  hereMarker = L.marker(e.latlng, {icon: icon})
    .addTo(map)
    .bindPopup('<h3>You are here!</h3>' + 
      '<a href="javascript:map.removeLayer(hereMarker);">Hide this</a>');
  if (!hasBookmark) {
    map.setView(e.latlng, 14);
  }

}

function clickGrid(e) {
  var d = e.data;
  if (!d)
    return;
  if (d.source && d.ref) {
    window.location.hash = d.source + '-' + d.ref;
  } 
  var searchterm;
  if (e.data.genus) {
      searchterm = toSpeciesCase(e.data.genus + (e.data.species ? " " + e.data.species : ""));
  } else if (e.data.common) {
    searchterm = e.data.common;
  } else {
    return;
  }
  var wikiapi = 'http://en.wikipedia.org/w/api.php?action=query&format=json';
  var textapi = wikiapi + '&prop=extracts&redirects&titles=';
  var imageapi = wikiapi + '&prop=pageimages&redirects&titles=';

  console.log('Searching Wikipedia for: ' + searchterm);
  $.ajax(imageapi + encodeURIComponent(searchterm), { dataType: 'jsonp', success: function(wikijson) {
    pages = wikijson.query.pages;
    page = pages[Object.keys(pages)[0]];
    if (page && page.thumbnail && page.thumbnail.source) {
      // TODO: if there is no high res image available, then the call to thumb/600px- fails. Not easy to handle
      // without making the failing call and then trying again.
      thumb = page.thumbnail.source.replace(/\/\d\dpx-/, L.Browser.retina ? '/600px-' : '/300px-');
      $("#wikiimg").html('<img src="' + thumb + '"/>');
      $("#wikiimg").append('<p><small><a href="https://en.wikipedia.org/wiki/File:' +page.pageimage + '">Source: Wikipedia. Click for attribution and licence.</a></small></p>');
    }
  }});
  $.ajax(textapi + encodeURIComponent(searchterm), { dataType: 'jsonp', success: function(wikijson) {
    pages = wikijson.query.pages;
    page = pages[Object.keys(pages)[0]];
    if (page && page.extract) {
      $("#wikitext").html(page.extract +
        '<p><small>Source: <a href="http://en.wikipedia.org/wiki/' + encodeURIComponent(page.title) + '">Wikipedia</a></small></p>');
      $("#wikitext").show();
    } else {
      // not found
      $("#wikiimg").html('');
      $("#wikitext").html('Nothing on Wikipedia.');
    }
  }});
}

if (window.location.href.match("embed")) {
  // cut down some chrome for embedding
  $("#header").hide();
  $("#logo").hide();
  $("#map").css("height","100%");
}


var base = "http://guru.cycletour.org/tilelive/",
    mapName = "supertrees_f59571";
    
var map;    
$.getJSON(base + mapName + ".json", {}, function(tilejson) {
  //tilejson.grids[0] = "http://guru.cycletour.org/tile/supertrees/{z}/{x}/{y}.grid.json";
  tilejson.grids[0] = 'http://guru.cycletour.org/treetiles/{z}/{x}/{y}.grid.json?updated=8';
  tilejson.tiles[0] = 'http://guru.cycletour.org/treetiles/{z}/{x}/{y}.png?updated=8';
  tilejson.maxzoom = 22;
  tilejson.minzoom = 8;
  delete tilejson.bounds;

  var treegrid = L.mapbox.gridLayer(tilejson);
  map = L.mapbox.map ('map', tilejson, {
    zoom: 12,
    tileLayer: { detectRetina: true }
  });

  var osmtrees = L.tileLayer("http://guru.cycletour.org/tile/osmtrees/{z}/{x}/{y}.png" );
  var interestingtrees = L.tileLayer("http://guru.cycletour.org/interesting/{z}/{x}/{y}.png?updated=7", {
    detectRetina:true} );

  L.control.layers(
    [], { "OpenStreetMap trees": osmtrees, "Interesting trees": interestingtrees},
    { "collapsed": false, position: "bottomright" }
    ).addTo(map);
  map.setView(L.latLng(-38, 144), 9);
  doBookmarks();

  map.gridLayer.on('click', clickGrid);
  map.on('locationfound', onLocationFound);
  map.locate();
});
