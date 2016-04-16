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
  OR scientific ilike 'Not %'; -- not applicable, not listed ...

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
WHERE trim(species) ILIKE 'sp.' 
   OR trim(species) ILIKE 'sp'
   OR trim(species) ILIKE 'spp'
   OR trim(species) ILIKE 'spp.'
   OR trim(species) ILIKE 'species'
   OR trim(species) ILIKE 'unknown';

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

 --33 only
\echo "Cordyline cordyline -> Cordyline"
UPDATE alltrees
SET scientific='Cordyline',species=''
WHERE scientific LIKE 'Cordyline cordyline';


drop table _speciesfix;
create table _speciesfix ( speciesfrom varchar, speciesto varchar, genus varchar);
insert into _speciesfix (speciesfrom, speciesto) values
  ('desmithiana', 'desmetiana'),
  ('linarifolia','linariifolia'),
  ('columellaris','columerauis'),
  ('bacculenta','bucculenta'),
  ('stypheliodes', 'styphelioides'),
  ('glaucophylla','glaucophyllus'),
  ('chanticleer','calleryana'), -- tecnhically a cultivar of calleryana
  ('capital','calleryana'), -- ditto
  ('gonyocalyx','goniocalyx'),
  ('nesophillia','nesophilia'),
  ('jorulensis','jorullensis'),
  ('blierana','x blireana'),
  ('monsplessulana', 'monspessulana');

insert into _speciesfix (speciesfrom, speciesto, genus) values
  ('syriaca', 'syriacus', 'Hibiscus');


UPDATE alltrees
SET scientific = '', species=speciesto
FROM _speciesfix
WHERE species ILIKE speciesfrom AND alltrees.genus ILIKE coalesce(_speciesfix.genus, alltrees.genus);


drop table _genusfix;
create table _genusfix ( genusfrom varchar, genusto varchar);
insert into _genusfix (genusfrom, genusto) values
    ('Melalauca%', 'Melaleuca'),
    ('Waterhousia','Waterhousea'),
    ('Robina','Robinia'),
    ('Sailx','Salix'),
    ('Poplus','Populus'),
    ('Photinea','Photinia'),
    ('Photina','Photinia'),
    ('Lophostermon','Lophostemon'),
    ('Leptosprmum','Leptospermum'),
    ('Qurecus','Quercus'),
    ('Angpohora','Angophora'),
    ('Pistachia','Pistacia')

    ;

UPDATE alltrees
SET scientific = '', genus=genusto
FROM _genusfix
WHERE genus ILIKE genusfrom;


UPDATE alltrees
SET scientific=trim(concat(genus, coalesce(' ', species)))
WHERE scientific='' AND genus <> '';


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
