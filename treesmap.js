function toSpeciesCase(str) {
  str = str.replace(/\s+Sp./i, '');
  str = str.replace(/\s+Cultivar/i, '');
  str = str.replace(/\s+'.*$/g, '');
  return str.toLowerCase().replace(/^w\w/, function (txt) { return txt.toUpperCase(); });
}

function doBookmarks(bookmark) {
  bookmarks={ 
    "adelaide": { x: 138.6217, y: -34.9491, z: 13 },
    "melbourne": { x: 144.95, y: -37.8, z: 11 },
    "manningham": { x: 145.15, y: -37.77, z: 13},
    "geelong": { x: 144.5, y: -38.15, z: 11}
  };
  if (!bookmark) {
    var matches = window.location.href.match(/#([a-zA-Z0-9_-]+)/);
    if (matches) {
      bookmark = matches[1];
    }

  }
  if (b = bookmarks[bookmark]) {
    map.setView(L.latLng(b.y,b.x), b.z);
  }

}

if (window.location.href.match("embed")) {
  // cut down some chrome for embedding
  $("#header").hide();
  $("#logo").hide();
  $("#map").css("height","100%");
}


var base = "http://guru.cycletour.org/tilelive/",
    mapName = "supertrees_f882c6";
    
var map;    
$.getJSON(base + mapName + ".json", {}, function(tilejson) {
  //tilejson.grids[0] = "http://guru.cycletour.org/tile/supertrees/{z}/{x}/{y}.grid.json";
  tilejson.grids[0] = 'http://guru.cycletour.org/treetiles/{z}/{x}/{y}.grid.json?updated=7';
  tilejson.tiles[0] = 'http://guru.cycletour.org/treetiles/{z}/{x}/{y}.png?updated=7';
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

  map.gridLayer.on('click',function(e) { 
    // e.data has what we clicked on
    if (e.data && e.data.genus) {
      var wikiapi = 'http://en.wikipedia.org/w/api.php?action=query&format=json';
      var textapi = wikiapi + '&prop=extracts&redirects&titles=';
      var imageapi = wikiapi + '&prop=pageimages&redirects&titles=';
      var species = toSpeciesCase(e.data.genus + (e.data.species ? " " + e.data.species : ""));
      console.log('Searching Wikipedia for: ' + species);
      $.ajax(imageapi + encodeURIComponent(species), { dataType: 'jsonp', success: function(wikijson) {
        pages = wikijson.query.pages;
        page = pages[Object.keys(pages)[0]];
        if (page && page.thumbnail && page.thumbnail.source) {
          thumb = page.thumbnail.source.replace(/\/\d\dpx-/, L.Browser.retina ? '/600px-' : '/300px-');
          $("#wikiimg").html('<img src="' + thumb + '"/>');
          $("#wikiimg").append('<p><small><a href="https://en.wikipedia.org/wiki/File:' +page.pageimage + '">Source: Wikipedia. Click for attribution and licence.</a></small></p>');
        }
      }});
      $.ajax(textapi + encodeURIComponent(species), { dataType: 'jsonp', success: function(wikijson) {
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
  });
});