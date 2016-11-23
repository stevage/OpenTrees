/* jshint esnext:true */
var fs = require('fs');
var request = require('request');
var colors = require('colors');
var exeq = require('exeq');
// jq -r ".[]|\"wget -nc -O data/\(.id).\(.format) '\(.download)'\"" sources.json | bash


    // {
    //     "id": "corangamite",
    //     "download": "http://data.gov.au/geoserver/corangamite-shire-trees/wfs?request=GetFeature&typeName=d9677ebb_f3db_45f3_88eb_04089debb9e0&outputFormat=json",
    //     "format": "geojson",
    //     "gdal_options": "-s_srs EPSG:4326"
    // },


var download = require('download');
var sources = require('./sources.json');
if (false) sources =     [    {
        "id": "ballarat",
        "download": "http://data.gov.au/dataset/eabaee3f-a563-449b-a04a-1ec847566ea1/resource/2f5eb80f-55fa-418c-915c-0b6de7653719/download/BallaratTrees.csv",
        "format": "csv",
        "filename": "ballarat.vrt"
    }
];
/*
function processWyndham(data) {
    var csv = require('csv');
    csv.parse(data, (err, data) => {

        csv.transform(record => {
        });
    });
}
*/
sources.forEach(function(source) {
    var urls = source.download;
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls.forEach(url => {
        // hmm, 'format' is used for saving the file, but also knowing what file to import.
        var format = source.format;
        if (!format && !source.keepExtension) {
            format = url.match(/\.([^.]+)$/)[1];
        }
        
        var filename = 'data/' + source.id + '.' + format;
        if (!fs.existsSync(filename)) {
            console.log('Downloading ' + /*source.download + ' to ' + */ filename);

            
            download(url).then(data => {

                /*if (filename === 'wyndham.csv') {
                    data = processWyndham(data);
                    //csvcut -c 3,5,9,10 wyndham.csv > wyndham-cut.csv

                }*/

                fs.writeFileSync(filename, data);            
                console.log('Downloaded '.green + filename);
                if (source.format === 'zip') {
                    //console.log('Unzipping ' + filename);
                    require('extract-zip')(filename, { dir: 'data/unzip' }, function(err) {
                        if (err) {
                            console.error('Error unzipping '.error + filename + ': ' + err);
                        } else {
                            console.log('Unzipped '.green + filename);
                            // done...
                        }
                    });
                }
            }).catch(function(err) {
                console.err(filename + ': ' + err);
            });
        } else {
            //console.log('(Skip ' + filename + ')');
        }
    });
});