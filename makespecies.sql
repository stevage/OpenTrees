DROP TABLE species;
SELECT genus,species,count(*)
INTO species
FROM alltrees
group BY genus,species

CREATE INDEX species_count ON species (count );

ALTER TABLE alltrees
ADD species_count integer;

UPDATE alltrees
SET species_count=count
FROM species
WHERE species.species=alltrees.species AND species.genus=alltrees.genus
AND alltrees.species <> '' AND alltrees.genus <> '';
