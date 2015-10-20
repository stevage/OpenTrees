DROP VIEW "1".trees;
DROP VIEW "1".specieslatlon;
DROP TABLE alltrees;
CREATE TABLE alltrees
(
  gid serial NOT NULL,
  geom character varying,
  the_geom geometry(Geometry,3857),
  tree_type character varying,
  genus character varying,
  species character varying,
  scientific character varying, -- combined field where it's not split
  variety character varying, -- the bit in quotes: Prunus cerasifera 'Nigra'
  description character varying, -- general description, possibly not a scientific name
  common character varying,
  height character varying,
  crown character varying,
  dbh character varying,
  health character varying,
  structure character varying,
  captured date,
  planted date,
  ule_min character varying,
  ule_max character varying,
  ref character varying,
  location character varying,
  maturity character varying,
  lat character varying,
  lon character varying,
  source character varying,
  surveytype character varying,
  CONSTRAINT alltrees_pkey PRIMARY KEY (gid)
)
;
\echo "Colac Otways"
INSERT INTO alltrees (the_geom, ref, genus, species, scientific, common, location, height, crown, dbh, planted, maturity, source)
SELECT the_geom,
tree_id AS ref,
genus_desc AS genus,
spec_desc AS species,
trim(concat(genus_desc, ' ', spec_desc)) AS scientific,
common_nam AS common,
split_part(location_t, ' ', 1) AS location,
height_m AS height,
canopy_wid AS crown,
diam_breas AS dbh,
CASE WHEN length(year_plant::varchar) = 4 THEN to_date(year_plant::varchar, 'YYYY') END AS planted,
life_stage AS maturity,
'colac_otways' AS source
FROM colac_otways;

\echo "Corangamite"
INSERT INTO alltrees (the_geom, ref, height, crown, scientific, common, location, source)
SELECT the_geom,
id AS ref,
height AS height,
width AS crown,
species AS scientific,
name AS common,
CASE when tree_type like 'STREET TREE' THEN 'street' when tree_type like 'PARK TREE' then 'park' else '' end AS location,
'corangamite' AS source
FROM corangamite;

\echo "Manningham"
INSERT INTO alltrees (the_geom, captured, ref, scientific, height, dbh, source)
select the_geom,
to_date(date1, 'YYYY-MM-DD') AS captured,
tree_no AS ref,
species AS scientific,
height AS height,
dbh AS dbh,
'manningham' AS source 
FROM manningham;

\echo "Ballarat"
INSERT INTO alltrees (the_geom, scientific, crown, ref, source)
select the_geom, 
case when tspecies like 'Not Assessed' then '' else tspecies end AS scientific,
tspread AS crown, -- not machine readable
central_as AS ref,
'ballarat' AS source
from ballarat;

\echo "Melbourne"
INSERT INTO alltrees (the_geom, ref, common, scientific, dbh, planted, maturity, ule_min, source)
SELECT the_geom,
"com id" AS ref,
"common name" AS common,
"scientific name" AS scientific,
"dbh (cm)" AS dbh,
to_date("date planted", 'DD/MM/YYYY') AS planted,
"age description" AS maturity,
"useful life expectency" AS ule_min,
'melbourne' AS source
FROM melbourne;

\echo "Geelong"
INSERT INTO alltrees (the_geom, tree_type, genus, species, scientific, common, height, dbh, health, structure, captured, ule_min, ule_max, ref, location, maturity, source)
SELECT the_geom,  tree_type, genus, species, concat(genus, ' ', lower(species)) AS scientific, common, height, dbh, health, structure, to_date(captured,'YYYY-MM-DD'), ule_min, ule_max, ref, location, maturity, 'geelong'
FROM geelong;

\echo "Wyndham"
INSERT INTO alltrees (the_geom, ref, source)
SELECT the_geom,
asset_id AS ref,
'wyndham' AS source
FROM wyndham;

\echo "Adelaide"
INSERT INTO alltrees (the_geom, ref, source, dbh, health, height, structure, maturity, scientific, common)
SELECT the_geom,
"asset id (identifier)",
'adelaide',
"circum (inspection)",
"vigour (inspection)",
"height (inspection)",
"structure (inspection)",
"age (inspection)",
"species name (inspection)",
"common name (inspection)"
FROM adelaide;

\echo "Waite Arboretum (Adelaide)"
INSERT INTO alltrees (the_geom, source, ref, scientific, common, planted)
SELECT the_geom,
'waite arboretum',
tree_id, -- also treeid and num
scientific,
commonname,
-- family (woot!)
CASE WHEN length(yearplant::varchar) = 4 THEN to_date(yearplant::varchar, 'YYYY') END AS planted
FROM waite;

\echo "Burnside (Adelaide)"
INSERT INTO alltrees(the_geom, source, ref, common, maturity, height)
-- also circumfere
SELECT the_geom, 
'Burnside', 
id, 
commonname,
treeage,
treeheight
FROM burnside;

\echo "Launceston"
INSERT INTO alltrees(the_geom, source, ref, common, scientific, maturity, planted, dbh, height, crown, health, captured)
SELECT the_geom,
'Launceston',
objectid,
name,
genusspeci,
age,
case when planteddat = '0' then NULL else planteddat::date end,
diameter_c,-- centimetres, I guess
height_m,
horizontal,
vitality,
auditdate::date --lasteditda
FROM launceston;

\echo "Hobsons Bay"
INSERT INTO alltrees(the_geom, source, genus, species, dbh, tree_type)
SELECT the_geom,
'Hobsons Bay',
Genus,
Species,
DBH,
Type
FROM hobsons_bay;

\echo "Glenelg"
INSERT INTO 
 alltrees(the_geom, source, ref,         name, genus, species, dbh, year_min, year_max, common, height, address, crown, age)
SELECT the_geom, 'Glenelg', description, name, genus, species, dbh, year_min, year_max, common, height, address, crown, age
FROM glenelg;



-- not used: grid, distrib, nrbtrees, nrbt_point, nattrustli, nt_num, habitat
\q
-- Should do something with SURVEYTYPE: Quadrat, Species List for Defined Area, Specimen, General observations, Incidental
\echo "VicGov VBA Flora100"
INSERT INTO alltrees (the_geom, source, ref, scientific, common, captured, description, surveytype)
SELECT the_geom,
'vba flora 100',
RECORD_ID AS ref,
SCI_NAME AS scientific,
COMM_NAME AS common,
to_date(STARTDATE::varchar, 'YYYYMMDD') AS captured, -- I have no idea what this date represents, goes back to 1700.
concat(coalesce(VIC_LF,''), ' (', SURVEYTYPE, ')') AS description, -- more we could jam in here
SURVEYTYPE AS surveytype
FROM flora100;

\echo "VicGov VBA Flora25"
INSERT INTO alltrees (the_geom, source, ref, scientific, common, captured, description, surveytype)
SELECT the_geom,
'vba flora 25',
RECORD_ID AS ref,
SCI_NAME AS scientific,
COMM_NAME AS common,
to_date(STARTDATE::varchar, 'YYYYMMDD') AS captured,
concat(coalesce(VIC_LF,''), ' (', SURVEYTYPE, ')') AS description,
SURVEYTYPE AS surveytype
FROM flora25;
