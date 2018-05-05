#!/usr/bin/env node --max-old-space-size=8192

var sources = require('./sources.json');

// const m={};
// Object.keys(require('./package.json').dependencies).forEach(d => m[d]=require(d));

// var ogr = require('ogr2ogr');
var fs = require('fs');
var child_process = require('child_process');

var source = 'data/southern_grampians.geojson';
sources.forEach(source => {
    // if (source.id !== 'ballarat') return;
    var filename;
    try {
        if (source.format.match(/geojson|csv/)) {
            var filename = `${source.id}.${source.format === 'csv' ? 'vrt' : source.format}`;
            //console.log(`ogr2ogr --config OGR_SQLITE_CACHE 512 -append -f SQLite ${db} -gt 65536 ${filename} -nln ${source.id} -lco SPATIAL_INDEX=NO`);
        } else if (source.format === 'zip') {
            filename = 'unzip/' + source.filename;
        } else if (source.loadname) {
            filename = source.loadname;
        } else {
            console.log('Skipping '.yellow + source.id)
        }
        if (filename) {
            // child_process.execSync(`ogr2ogr --config OGR_SQLITE_CACHE 512 -append -f SQLite ${db} -gt 65536 ${filename} -nln ${source.id} -lco SPATIAL_INDEX=NO`);
            console.log(filename);
            child_process.execSync(`ogr2ogr -oo RFC7946=YES -t_srs EPSG:4326 -gt 65536 -f GeoJSON ../tmp/out_${source.id}.geojson ${filename}`, { cwd: 'data' });
            console.log(`Loaded ${filename}`);
        }
    } catch (e) {
        console.log(`Error with ${filename}`);
    }
})
//m.exeq(`ogr2ogr --config OGR_SQLITE_CACHE 512 -f SQLite ${db} -gt 65536 ${source} -nln southern_grampians -lco SPATIAL_INDEX=NO`)
