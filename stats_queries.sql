# Top genus
select concat(genus,' (',count(*),')') from alltrees group by genus order by count(*) desc;

# Top species:
select concat(genus,' ',species,' (',count(*),')') from alltrees group by genus,species order by count(*) desc;

# Top cultivars:
select concat(genus,' ',species,' (',count(*),')') from alltrees where scientific ilike '% x %' group by genus,species order by count(*) desc;

# Top species by council:
select (select concat(a.source, ': ', genus,' ',species) from alltrees a where a.source=b.source and a.species <> '' group by source, genus, species order by count(*) desc limit 1) from alltrees b group by source;

# Distinct species per council
select source, count(distinct concat(genus,species)) from alltrees group by source order by count(distinct concat(genus,species)) desc;

# Average number of trees per species, by council
select concat(source,' (', count(*) * 100 / count(distinct concat(genus,species)),')') from alltrees group by source order by count(distinct concat(genus,species)) desc;
