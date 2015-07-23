create schema "1";


grant select on alltrees to readtrees;
create view "1".trees as select *, concat(source,'-',ref) AS uniqueref from alltrees;
grant select on "1".trees to readtrees; 
grant usage on schema "1" to readtrees;

create view "1".specieslatlon as select genus,species,variety, source, ref, lat,lon from alltrees;
grant select on "1".specieslatlon to readtrees; 
