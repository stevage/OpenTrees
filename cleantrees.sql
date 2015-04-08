\echo 'Remove "Vacant Planting", "Natives - mixed" etc'
UPDATE alltrees
SET scientific='', genus='', species='', description=scientific
WHERE scientific='Vacant Planting' 
  OR scientific ILIKE 'Native%'
  OR scientific ILIKE 'Ornamental%'
  OR scientific ILIKE 'Rose %'
  OR scientific ILIKE 'Fan Palm%'
  OR scientific ILIKE 'Unidentified%'
  OR scientific ILIKE 'Unknown%'
  OR scientific ILIKE 'Stump';

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

\echo "Process species identied as 'Sp.' or 'Spp'"
-- 'Sp.' means non-identified species, 'Spp.' technically means a mix of several unidentified species.
UPDATE alltrees
SET species=''
WHERE lower(trim(species)) LIKE 'sp.' 
   OR lower(trim(species)) LIKE 'sp'
   OR lower(trim(species)) LIKE 'spp'
   OR lower(trim(species)) LIKE 'spp.';

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

\echo "Fix 'Botlebrush'es"
UPDATE alltrees
SET common='Red Bottlebrush',species='',variety='King''s Park Special'
WHERE scientific='Callistemon kings park special' AND common ILIKE '%botle%';

\echo "Fix euky dwarves"
UPDATE alltrees
SET scientific='Eucalyptus leucoxylon',species='leucoxylon'
WHERE scientific LIKE 'Eucalyptus leucoxylon euky dwar%';

\echo "Fix Angpohoras"
UPDATE alltrees
SET scientific='Angophora costata',genus='Angophora'
WHERE scientific LIKE 'Angpohora costata';

\echo "Fix Qurecus"
UPDATE alltrees
SET genus='Quercus'
WHERE genus='Qurecus';

\echo "Fix bacculenta"
UPDATE alltrees
SET species='bucculenta', scientific='Hakea bucculenta'
WHERE scientific='Hakea bacculenta'

\echo "Fix Leptosprmum"
UPDATE alltrees
SET scientific='Leptospermum laevigatum',genus='Leptospermum'
WHERE scientific LIKE 'Leptosprmum laevigatum';

\echo "Fix Lophostermon"
UPDATE alltrees
SET scientific='Lophostemon confertus',genus='Lophostemon'
WHERE scientific LIKE 'Lophostermon confertus';

\echo "Fix Photina, Photinea"
UPDATE alltrees
SET scientific=concat('Photinia ', species),genus='Photinia'
WHERE genus LIKE 'Photinea' OR genus LIKE 'Photina';

\echo "Fix Poplus"
UPDATE alltrees
SET scientific=concat('Populus ', species),genus='Populus'
WHERE genus LIKE 'Poplus';

 --33 only
\echo "Fix Cordylines"
UPDATE alltrees
SET scientific='Cordyline',species=''
WHERE scientific LIKE 'Cordyline cordyline';



\echo "Blank out non-assessed crown widths."
UPDATE alltrees
SET crown=NULL
WHERE crown ilike 'Not Assessed';

-- TODO: handle all the dbh's that are ranges in mm.

\echo Create indexes
CREATE INDEX alltrees_species ON alltrees (genus,species);
CREATE INDEX alltrees_source ON alltrees (source);
VACUUM ANALYZE alltrees;