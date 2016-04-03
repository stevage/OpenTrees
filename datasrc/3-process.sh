#!/bin/bash
DBNAME=trees
TABLE=trees
echo "Merging all trees into one table."
psql -d $DBNAME -f mergetrees.sql
showcount alltrees

echo "Cleaning and processing merged trees."
psql -d $DBNAME -f cleantrees.sql

echo "Processing DBH columns."
psql -d $DBNAME -f cleandbh.sql

echo "Making species interestingness table."
psql -d $DBNAME -f makespecies.sql

echo "Setting lat/lon for ease of use."
# Using xmin/ymin deals with multipoints
psql -d $DBNAME -c 'UPDATE alltrees SET lon=st_xmin(st_transform(the_geom,4674)),lat=st_ymin(st_transform(the_geom,4674))'

echo "Making pgrest views"
psql -d $DBNAME -f pgrest.sql


echo "Dumping all data to disk and zipping as alltrees.tar.gz"
psql -d $DBNAME -c "\copy alltrees to 'alltrees-tmp.csv' csv header"
csvcut -C 3 < alltrees-tmp.csv > alltrees.csv
rm alltrees-tmp.csv
tar -czvf alltrees.tar.gz alltrees.csv

date
