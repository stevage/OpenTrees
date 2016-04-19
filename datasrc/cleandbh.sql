-- Rules for DBH

-- Convert to dbh_cm_min and dbh_cm_max
-- 1.4 -> 140, 140

-- 100-150 -> 100, 150

-- How many?

-- [0-9]+ : 206520
-- [0-9]+-[0-9]+: 67372
-- [0-9]+.[0-9]+: 472


-- select dbh,count(*) from alltrees where dbh not similar to '[0-9]+([.-][0-9]+)?|Not Applicable|Unknown||' group by dbh;
--      dbh      | count
-- --------------+-------
--  >3m          |    48
--  1000mm+      |   645
--  0m -1m       |  3058
--  500 - 1000mm |  5627
--  1m - 2m      |  2321
--  2m - 3m      |   370
--  100 - 250mm  | 22131
--  250 - 500mm  | 14706
--  0 - 100mm    | 20944

 alter table alltrees add dbh_cm_min integer;
 alter table alltrees add dbh_cm_max integer;

 update alltrees set dbh_cm_min = 300 where dbh='>3m';
 update alltrees set dbh_cm_min = 100 where dbh='1000mm+';
 update alltrees set dbh_cm_min = 0, dbh_cm_max=100 where dbh='0m -1m';
 update alltrees set dbh_cm_min = 50, dbh_cm_max=100 where dbh='500 - 1000mm';
 update alltrees set dbh_cm_min = 0, dbh_cm_max=10 where dbh='0 - 100mm';
 update alltrees set dbh_cm_min = 10, dbh_cm_max=25 where dbh='100 - 250mm';
 update alltrees set dbh_cm_min = 25, dbh_cm_max=50 where dbh='250 - 500mm';
 update alltrees set dbh_cm_min = 100, dbh_cm_max=200 where dbh='1m - 2m';
 update alltrees set dbh_cm_min = 200, dbh_cm_max=300 where dbh='2m - 3m';
 

-- cm: geelong, glenelg, melbourne
update alltrees set dbh_cm_min = cast(substring(dbh from '^\d+') as integer) 
where dbh ~ '^\d+$' and source not in ('Colac-Otways','Launceston');

-- mm: colac_otways, launceston
update alltrees set dbh_cm_min = cast(substring(dbh from '^\d+') as integer) / 10 
where dbh ~ '^\d+$' and source in ('Colac-Otways','Launceston');

-- hobsons_bay (mm)
update alltrees set dbh_cm_min = cast(substring(dbh from '^\d+') as integer)/10, dbh_cm_max = cast(substring(dbh from '\d+$') as integer)*10 
where dbh ~ '^\d+-\d+$' and source in ('Hobsons Bay');

-- Glenelg (m)
update alltrees set dbh_cm_min = (cast(substring(dbh from '^\d+.^d+') as float) * 100)  
where dbh ~ '^\d+\.\d+$';