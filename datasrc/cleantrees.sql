UPDATE alltrees
SET scientific=trim(concat(genus, ' ', species))
WHERE scientific IS NULL;

\echo 'Remove vacant plantings'
DELETE FROM alltrees
WHERE scientific='Vacant Planting' OR description='Vacant Planting';

\echo 'Convert "Stump", "Natives - mixed" etc to descriptions'
UPDATE alltrees
SET scientific='', genus='', species='', description=scientific
WHERE scientific ILIKE 'Native%'
  OR scientific ILIKE 'Ornamental%'
  OR scientific ILIKE 'Unidentified%'
  OR scientific ILIKE 'Unknown%'
  OR scientific ILIKE 'Stump'
  OR scientific ilike 'Not listed';

UPDATE alltrees
SET scientific='', genus='', species='', common=scientific
WHERE scientific ILIKE 'Rose %'
  OR scientific ILIKE 'Fan Palm%';
  

\echo "Split variety from scientific name"
UPDATE alltrees
SET variety=trim(replace(substr(scientific, strpos(scientific, '''')), '''', '') ),
    scientific=trim(substr(scientific, 1, strpos(scientific, '''')-1))
WHERE scientific LIKE'%''%';


-- Split variety from species: 
/* -- not needed
UPDATE alltrees
SET variety=trim(substr(species, strpos(species, ''''))),
    species=trim(substr(species, 1, strpos(species, '''')))
WHERE species LIKE'%''%';
*/
\echo "Split scientific names into genus, species: Split 'Cedrus atlantica' -> Cedrus, atlantica"
UPDATE alltrees
SET genus=trim(substr(scientific, 1, strpos(scientific, ' ') - 1)),
    species=trim(substr(scientific, strpos(scientific, ' ')))
WHERE scientific LIKE'% %' and genus is null;

\echo "Process species identified as 'Sp.' or 'Spp'"
-- 'Sp.' means non-identified species, 'Spp.' technically means a mix of several unidentified species.
UPDATE alltrees
SET species=''
WHERE lower(trim(species)) LIKE 'sp.' 
   OR lower(trim(species)) LIKE 'sp'
   OR lower(trim(species)) LIKE 'spp'
   OR lower(trim(species)) LIKE 'spp.'
   OR lower(trim(species)) LIKE 'species';

\echo "Handle 'cultivar'"
UPDATE alltrees
SET variety=species, species=''
WHERE species ILIKE 'cultivar';

\echo "Handle subspecies, splitting any multi-part species name."
UPDATE alltrees
SET species=trim(substr(species, 1, strpos(species, ' ') - 1)),
    variety=trim(concat(substr(species, strpos(species, ' ')), ' ', variety))
WHERE species LIKE '% %' AND species not ILIKE 'x %';

\echo "If still no genus, make the scientific name the genus."
UPDATE alltrees
SET genus=trim(scientific)
WHERE coalesce(genus,'')='' AND scientific <> '';

\echo "Set case"
UPDATE alltrees
SET genus=initcap(genus),
    species=lower(species);

\echo "Turn nulls into blanks"
UPDATE alltrees
SET genus=coalesce(genus,''), 
    species=coalesce(species,''), 
    variety=coalesce(variety,''),
    scientific=coalesce(scientific,'')
WHERE coalesce(genus,species,variety,scientific,'Z') = 'Z';

\echo "Botlebrush -> Bottlebrush"
UPDATE alltrees
SET common='Red Bottlebrush',species='',variety='King''s Park Special'
WHERE scientific='Callistemon kings park special' AND common ILIKE '%botle%';

\echo "Eucalyptus leucoxylon euky dwarf -> Eucalyptus leucoxylon"
UPDATE alltrees
SET scientific='Eucalyptus leucoxylon',species='leucoxylon'
WHERE scientific LIKE 'Eucalyptus leucoxylon euky dwar%';

\echo "Angpohoras -> Angophora"
UPDATE alltrees
SET scientific='Angophora costata',genus='Angophora'
WHERE scientific LIKE 'Angpohora costata';

\echo "Qurecus -> Quercus"
UPDATE alltrees
SET genus='Quercus'
WHERE genus='Qurecus';

\echo "Bacculenta -> Bucculenta"
UPDATE alltrees
SET species='bucculenta', scientific='Hakea bucculenta'
WHERE scientific='Hakea bacculenta';

\echo "Leptosprmum -> Leptospermum"
UPDATE alltrees
SET scientific='Leptospermum laevigatum',genus='Leptospermum'
WHERE scientific LIKE 'Leptosprmum laevigatum';

\echo "Lophostermon -> Lophostemon"
UPDATE alltrees
SET scientific='Lophostemon confertus',genus='Lophostemon'
WHERE scientific LIKE 'Lophostermon confertus';

\echo "Photina, Photinea -> Photinia"
UPDATE alltrees
SET scientific=concat('Photinia ', species),genus='Photinia'
WHERE genus LIKE 'Photinea' OR genus LIKE 'Photina';

\echo "Poplus -> Populus"
UPDATE alltrees
SET scientific=concat('Populus ', species),genus='Populus'
WHERE genus LIKE 'Poplus';

\echo "Sailx -> Salix"
UPDATE alltrees
SET scientific=concat('Salix ', species),genus='Salix'
WHERE genus LIKE 'Sailx';


 --33 only
\echo "Cordyline cordyline -> Cordyline"
UPDATE alltrees
SET scientific='Cordyline',species=''
WHERE scientific LIKE 'Cordyline cordyline';

\echo "Melalauca -> Melaleuca"
UPDATE alltrees
SET genus='Melaleuca', scientific = concat('Melaleuca ', species)
WHERE genus LIKE 'Melalauca%';


\echo "Waterhousia -> Waterhousea"
UPDATE alltrees
SET genus='Waterhousea', scientific = concat('Waterhousea ', species)
WHERE genus LIKE 'Waterhousia';

UPDATE alltrees
SET species='styphelioides', scientific = ''
WHERE species='stypheliodes';

UPDATE alltrees
SET species='linariifolia', scientific = ''
WHERE species='linarifolia';

UPDATE alltrees
SET species='columellaris', scientific = ''
WHERE species LIKE 'columerauis';

UPDATE alltrees
SET scientific=concat(genus, ' ', species)
WHERE scientific='' AND genus <> '' AND species <> '';


\echo "Flip genus, species of Pyrus, Eucalyptus, Dodonaea, Metrosideros"
UPDATE alltrees
SET species=lower(genus), genus=initcap(species), scientific = concat(initcap(species), ' ', lower(genus))
WHERE lower(species) in ('pyrus', 'eucalyptus', 'dodonaea', 'metrosideros', 'buxus');

\echo "Blank out non-assessed crown widths."
UPDATE alltrees
SET crown=NULL
WHERE crown ilike 'Not Assessed';

-- TODO: handle all the dbh's that are ranges in mm.

\echo Create indexes
CREATE INDEX alltrees_species ON alltrees (genus,species);
CREATE INDEX alltrees_source ON alltrees (source);
VACUUM ANALYZE alltrees;
