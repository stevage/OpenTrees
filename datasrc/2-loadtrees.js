var sources = require('./sources.json');

const m={};
Object.keys(require('./package.json').dependencies).forEach(d => m[d]=require(d));

var ogr = require('ogr2ogr');
var fs = require('fs');
var child_process = require('child_process');
/*var source = ogr('data/southern_grampians.geojson')
                .format('SQLite')
                .destination('data/out.sqlite')
                .exec((er, data) => {
                    console.log(er);
                });
                //.stream()
                //.pipe(fs.createWriteStream('data/out2.sqlite'));
*/

var db = 'data/out.sqlite';
try {
    fs.unlinkSync(db);
} catch (e) { }
var source = 'data/southern_grampians.geojson';
sources.forEach(source => {
    var filename;
    try {
        if (source.format.match(/geojson|csv/)) {
            var filename = `data/${source.id}.${source.format}`;
            //console.log(`ogr2ogr --config OGR_SQLITE_CACHE 512 -append -f SQLite ${db} -gt 65536 ${filename} -nln ${source.id} -lco SPATIAL_INDEX=NO`);
            console.log(`Loaded ${source.id}`);
        } else if (source.format === 'zip') {
            filename = 'data/unzip/' + source.filename;
        } else if (source.loadname) {
            filename = 'data/' + source.loadname;
        } else {
            console.log('Skipping '.yellow + source.id)
        }
        if (filename) {
            child_process.execSync(`ogr2ogr --config OGR_SQLITE_CACHE 512 -append -f SQLite ${db} -gt 65536 ${filename} -nln ${source.id} -lco SPATIAL_INDEX=NO`);
        }
    } catch (e) {
        console.log(`Error with ${filename}`);
    }
})
//m.exeq(`ogr2ogr --config OGR_SQLITE_CACHE 512 -f SQLite ${db} -gt 65536 ${source} -nln southern_grampians -lco SPATIAL_INDEX=NO`)
