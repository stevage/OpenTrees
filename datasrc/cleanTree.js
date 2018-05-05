function cleanTree(t) {
    //\echo "Turn nulls into blanks"
    // previously this test only happened if all of these were null. significant?
    t.genus = t.genus || '';
    t.species = t.species || '';
    t.variety = t.variety || '';
    t.scientific = t.scientific || '';


    t.scientific=(t.genus + ' ' + t.species).trim();

    // 'Remove vacant plantings'
    if (t.scientific === 'Vacant Planting' || t.description === 'Vacant Planting') {
        t._del = true;
        return; // TODO
    }

    //'Convert "Stump", "Natives - mixed" etc to descriptions'
    if (t.scientific.match(/^(Native|Ornamental|Unidentified|Unknown|Stump|Not )/i)) {
        t.description = t.scientific;
        t.scientific = t.genus = t.species = '';
    }

    if (t.scientific.match(/^(Rose |Fan Palm)/i)) {
        t.common = t.scientific;
        t.scientific = t.genus = t.species = '';
    }

    /* TODO  

    \echo "Split variety from scientific name"
    UPDATE alltrees
    SET variety=trim(replace(substr(scientific, strpos(scientific, '''')), '''', '') ),
        scientific=trim(substr(scientific, 1, strpos(scientific, '''')-1))
    WHERE scientific LIKE'%''%';

    */
    let parts = t.scientific.split(' ');
    //"Split scientific names into genus, species: Split 'Cedrus atlantica' -> Cedrus, atlantica"
    if (parts.length >= 2 && !t.genus) {
        t.genus = parts[0];
        t.specus = parts[1];
    }


    //\echo "Process species identified as 'Sp.' or 'Spp'"
    //-- 'Sp.' means non-identified species, 'Spp.' technically means a mix of several unidentified species.
    if (t.species.trim().match(/^(sp|sp\.|spp|spp\.|species|unknown)$/i)) {
        t.species = '';
    }

    //\echo "Handle 'cultivar'"
    if (t.species.match(/^cultivar$/i)) {
        t.variety = t.species;
        t.species = '';
    }

    // \echo "Handle subspecies, splitting any multi-part species name."
    let speciesParts = t.species.split(' ');
    if (speciesParts.length >= 2 && speciesParts[0].toLowerCase() !== 'x') {
        t.species = t.speciesParts[0];
        t.variety = t.speciesParts[1];
    }

    // \echo "If still no genus, make the scientific name the genus."
    if (t.scientific && !t.genus) {
        t.genus = t.scientific.trim();
    }
    

    //\echo "Set case"
    if (t.genus) {
        t.genus = t.genus[0].toUpperCase() + t.genus.slice(1).toLowerCase();
        t.species = t.species.toLowerCase();
    }


    // \echo "Botlebrush -> Bottlebrush"
    if (t.scientific.match(/Callistemon kings park special/i) && t.common.match(/botle/)) {
        t.common = 'Red Bottlebrush';
        t.species = '';
        t.variety = "King's Park Special";
    }

    [
        [/Cordyline cordyline/i, 'Cordyline', 'Cordyline', ''],
        [/Eucalyptus leucoxylon euky dwar/i, 'Eucalyptus leucoxylon', 'Eucalyptus', 'leucoxylon'],
    ].forEach(a => {
        let [scientificFrom, scientificTo, genusTo, speciesTo] = a;
        if (t.scientific.match(scientificFrom)) {
            t.scientific = scientificTo;
            t.genus = genusTo;
            t.species = speciesTo;
        }        
    });

    [
        ['desmithiana', 'desmetiana'],
        ['linarifolia','linariifolia'],
        ['columellaris','columerauis'],
        ['bacculenta','bucculenta'],
        ['stypheliodes', 'styphelioides'],
        ['glaucophylla','glaucophyllus'],
        ['chanticleer','calleryana'], // tecnhically a cultivar of calleryana
        ['capital','calleryana'], // ditto
        ['gonyocalyx','goniocalyx'],
        ['nesophillia','nesophilia'],
        ['jorulensis','jorullensis'],
        ['blierana','x blireana'],
        ['monsplessulana', 'monspessulana']
    ].forEach(a => {
        let [speciesFrom, speciesTo] = a;
        if (t.species.match(speciesFrom)) {
            t.species = speciesTo;
            t.scientific = '';
        }        
    });


    // insert into _speciesfix (speciesfrom, speciesto, genus) values
    //   ('syriaca', 'syriacus', 'Hibiscus');

    [
        ['Melalauca%', 'Melaleuca'],
        ['Waterhousia','Waterhousea'],
        ['Robina','Robinia'],
        ['Sailx','Salix'],
        ['Poplus','Populus'],
        ['Photinea','Photinia'],
        ['Photina','Photinia'],
        ['Lophostermon','Lophostemon'],
        ['Leptosprmum','Leptospermum'],
        ['Qurecus','Quercus'],
        ['Angpohora','Angophora'],
        ['Pistachia','Pistacia']
    ].forEach(a => {
        let [genusFrom, genusTo] = a;
        if (t.genus.match(genusFrom)) {
            t.genus = genusTo;
            t.scientific = '';
        }        
    });

    if (t.scientific === '' && t.genus !== '') {
        t.scientific = (t.genus + ' ' + t.species).trim();
    }


    /* TODO
    \echo "Flip genus, species of Pyrus, Eucalyptus, Dodonaea, Metrosideros"
    UPDATE alltrees
    SET species=lower(genus), genus=initcap(species), scientific = concat(initcap(species), ' ', lower(genus))
    WHERE lower(species) in ('pyrus', 'eucalyptus', 'dodonaea', 'metrosideros', 'buxus');
    */

    // \echo "Blank out non-assessed crown widths."
    if ((t.crown || '').match(/not assessed/i)) {
        t.crown = undefined;
    }
    
    // -- TODO: handle all the dbh's that are ranges in mm.
    // console.log(t.scientific);
    return t;
    
}
module.exports = cleanTree;