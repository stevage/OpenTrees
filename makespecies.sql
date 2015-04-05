DROP TABLE species;
SELECT genus,species,count(*)
INTO species
FROM alltrees
group BY genus,species

CREATE INDEX species_count ON species (count );