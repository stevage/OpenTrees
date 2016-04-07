ALTER TABLE alltrees
ADD woodiness varchar;

ALTER TABLE alltrees
ADD evergreen varchar;

UPDATE alltrees
SET evergreen=evergreen."Phenology"
FROM evergreen
WHERE evergreen."Binomial"=concat(alltrees.genus,' ',alltrees.species);

UPDATE alltrees
SET evergreen='D'
WHERE alltrees.genus in ('Platanus', 'Ulmus','Quercus');

UPDATE alltrees
SET evergreen='E'
WHERE alltrees.genus in ('Eucalyptus','Corymbia','Araucaria' /* not in leaf phenology db */);

UPDATE alltrees
SET evergreen='D'
WHERE scientific in ('Fraxinus oxycarpa'); /* Synonym, angustifolia */

UPDATE alltrees
SET woodiness=woodiness.woodiness
FROM woodiness
WHERE woodiness.gs=concat(alltrees.genus,' ',alltrees.species);
