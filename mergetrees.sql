DROP TABLE alltrees;
CREATE TABLE alltrees
(
  gid serial NOT NULL,
  geom character varying,
  the_geom geometry(Geometry,3857),
  tree_type character varying,
  genus character varying,
  species character varying,
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
  CONSTRAINT alltrees_pkey PRIMARY KEY (gid)
)
;

INSERT INTO alltrees (the_geom, ref, genus, species, common, location, height, crown, dbh, planted, maturity, source)

SELECT the_geom,
tree_id AS ref,
genus_desc AS genus,
spec_desc AS species,
common_nam AS common,
split_part(location_t, ' ', 1) AS location,
height_m AS height,
canopy_wid AS crown,
diam_breas AS dbh,
CASE WHEN length(year_plant::varchar) = 4 THEN to_date(year_plant::varchar, 'YYYY') END AS planted,
life_stage AS maturity,
'colac_otways' AS source
FROM colac_otways;

INSERT INTO alltrees (the_geom, ref, height, crown, species, common, location, source)
SELECT the_geom,
id AS ref,
height AS height,
crownwidth AS crown,
bot_name AS species,
com_name AS common,
CASE when tree_type like 'STREET TREE' THEN 'street' when tree_type like 'PARK TREE' then 'park' else '' end AS location,
'corangamite' AS source
FROM corangamite;

INSERT INTO alltrees (the_geom, captured, ref, species, height, dbh, source)
select the_geom,
to_date(date1, 'YYYY-MM-DD') AS captured,
tree_no AS ref,
species AS species,
height AS height,
dbh AS dbh,
'manningham' AS source 
FROM manningham;


INSERT INTO alltrees (the_geom, species, crown, ref, source)
select the_geom, 
case when tspecies like 'Not Assessed' then '' else tspecies end AS species,
tspread AS crown, -- not machine readable
central_as AS ref,
'ballarat' AS source
from ballarat;

INSERT INTO alltrees (the_geom, ref, common, species, dbh, planted, maturity, ule_min, source)

SELECT the_geom,
"com id" AS ref,
"common name" AS common,
"scientific name" AS species,
"dbh (cm)" AS dbh,
to_date("date planted", 'DD/MM/YYYY') AS planted,
"age description" AS maturity,
"useful life expectency" AS ule_min,
'melbourne' AS source
FROM melbourne;

INSERT INTO alltrees (the_geom, tree_type, genus, species, common, height, dbh, health, structure, captured, ule_min, ule_max, ref, location, maturity, source)
SELECT the_geom,  tree_type, genus, concat(genus, ' ', species) AS species /* sorry! */, common, height, dbh, health, structure, to_date(captured,'YYYY-MM-DD'), ule_min, ule_max, ref, location, maturity, 'geelong'
FROM geelong;

INSERT INTO alltrees (the_geom, ref, source)
SELECT the_geom,
asset_id AS ref,
'wyndham' AS source
FROM wyndham;
