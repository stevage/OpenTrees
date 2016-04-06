ALTER TABLE alltrees
ADD woodiness varchar;

ALTER TABLE alltrees
ADD evergreen varchar;

UPDATE alltrees
SET evergreen=evergreen."Phenology"
FROM evergreen
WHERE evergreen."Binomial"=concat(alltrees.genus,' ',alltrees.species);

UPDATE alltrees
SET woodiness=woodiness.woodiness
FROM woodiness
WHERE woodiness.gs=concat(alltrees.genus,' ',alltrees.species);
