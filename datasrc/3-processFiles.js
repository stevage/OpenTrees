// const glob = require('glob');
const fs = require('fs');
// const processTree = require('./3-processTree');
const jsonfile = require('jsonfile');

let sources = require('./sources.json');
const cleanTree = require('./cleanTree');
// sources = 'melbourne ballarat'.split(' ').map(x => ({ id: x }));

//glob('out_*.geojson', {}, files => {
//    files.forEach(file => {


/* Given a GeoJSON feature, return a different one. */
function processTree(source, tree) {
    var src = tree.properties;
    
    var props = tree.properties = {
        source: source
    };
    let identity = {};
    Object.keys(tree.properties).forEach(p => identity[p] = p);
    const crosswalk = {
        ryde: {
            height: 'height',
        },
        melbourne: {
            ref: 'com_id',
            common: 'Common Name',
            scientific: 'Scientific Name',
            dbh: 'Diameter Breast Height',
            //planted: x => processDate(x['date planted']),
            planted: 'Date Planted',
            maturity: 'Age Description',
            ule_min: 'Useful Life Expectency',
            location: 'Located In'
        },
        southern_grampians: {
            ref: 'ref',
            scientific: 'species',
            common: 'common',
            location: 'location',
            height:'height',
            crown: 'crown',
            maturity:'maturity'
        }, colac_otways: {
            ref: 'tree_id',
            genus: 'genus_desc',
            species: 'spec_desc',
            scientific: x => `${x.genus_desc} ${x.spec_desc}`.trim(),
            common: 'common_nam',
            location: x => x.location_t.split(' ')[1],
            height: 'height_m',
            crown: 'canopy_wid',
            dbh: 'diam_breas',
            // planted: CASE WHEN length(year_plant::varchar) = 4 THEN to_date(year_plant::varchar, 'YYYY') END AS planted,
            maturity: 'life_stage'
        }, corangamite: {
            ref: 'id',
            height: 'height',
            crown: 'width',
            scientific: 'species',
            common: 'name',
            location: x => ({ 'STREET TREE': 'street', 'PARK TREE': 'park' }[x.tree_type] || '')
        }, manningham: {
            captured: 'date1',  // TODO YYYY-MM-DD
            ref: 'tree_no', 
            scientific: 'species', 
            height: 'height', 
            dbh: 'dbh'
        }, geelong: {
            ...identity,
            scientific: x => x.genus + ' ' + (x.species || '').toLowerCase(),
            // TODO captured is a date

        }, wyndham: {
            ref: 'asset_id'
        }, adelaide: {
            ref: 'asset id (identifier)',
            dbh: 'circum (inspection)',
            health: 'vigour (inspection)',
            height: 'height (inspection)',
            structure: 'structure (inspection)',
            maturity: 'age (inspection)',
            scientific: 'species name (inspection)',
            common: 'common name (inspection)'
        }, waite_arboretum: {
            ref: 'tree_id',
            scientific: 'scientific',
            common: 'commonname',
            //planted: CASE WHEN length(yearplant::varchar) = 4 THEN to_date(yearplant::varchar, 'YYYY') END AS planted
        }, burnside: {
            ref: 'id',
            common: 'commonname',
            maturity: 'treeage',
            height: 'treeheight'
        }, launceston: {
            ref: 'objectid',
            common: 'name',
            scientific: 'genusspeci',
            maturity: 'age',
            // planted: '', case when planteddat = '0' then NULL else planteddat::date end,
            dbh: 'diametr_c',
            height: 'height_m',
            crown: 'horizontal',
            health: 'vitality',
            captured: 'auditdate' // TODO date
        }, hobsons_bay: {
            genus: 'Genus',
            species: 'Species',
            dbh: 'DBH',
            tree_type: 'Type'
        }, glenelg: {
            ...identity
        }, perth: {
            ref: 'Tree_ID',
            common: 'Common_Nam',
            scientific: 'Botanical',
            family: 'Family',
            height: 'Height',
            health: 'Health',
            structure: 'Structure',
            maturity: 'Age_Class',
            //ule_ Life_Expec

        }


        /*ballarat: {
            scientific: 'species',
            crown: 'crown',
            ref: 'ref',
            common: 'common',
            location: 'maturity',
            maturity: '',
            health: '',
            structure: '',
            variety: '',
            description: '',
            ule_min: '',
            ule_max
        }*/
    
    }[source] || {};
    // TODO scrap all non-standard fields (esp lat, lon, ...)

    // TODO support standard datasets:
    /*
    ballarat

    */

    Object.keys(crosswalk).forEach(prop => {
        let val = (typeof crosswalk[prop] === 'function') ? crosswalk[prop](src) : src[crosswalk[prop]];
        tree.properties[prop] = val;
    });
    return tree;
}

const out = fs.createWriteStream('tmp/allout.json').on('error', console.error);
sources.forEach(source => {
    let trees;
    try {
        trees = jsonfile.readFileSync('tmp/out_' + source.id + '.geojson').features;
    } catch (e) { 
        return;
    }    
    console.log(source.id + ': ' + trees.length);
    trees.forEach(tree => {
        // console.log('yerp');
        tree = processTree(source.id, tree);
        cleanTree(tree);
        if (!tree._del) {
            out.write(JSON.stringify(tree) + '\n');
        }
    });
    console.log('Done ' + source.id);

    // out.write(JSON.stringify(tree) + '\n'); 
});