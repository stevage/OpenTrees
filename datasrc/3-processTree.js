/* Given a GeoJSON feature, return a different one. */
function processTree(source, tree) {
    var src = tree.properties;
    
    var props = tree.properties = {
        source: source
    };
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
        }
    }[source] || {};

    Object.keys(crosswalk).forEach(prop => {
        if (typeof crosswalk[prop] === 'function') {
            tree.properties[prop] = crosswalk[prop](src);
        } else {
            tree.properties[prop] = src[prop];
        }
    });
    // don't actually need to return anything.
}