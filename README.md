# opentrees.org

This repository contains:

1. Scripts to fetch, load, merge and clean open tree data from various Australian local councils, into a PostGIS database.
2. A static website for browsing that data using Mapbox-GL-JS, with the magic of vector tiles. (The scripts to convert the data to vector tiles are here: https://github.com/stevage/vector-tile-scripts)
3. A previous version of the website, using raster tiles, generated using TileMill. (In the `/v1` directory)

The source code for the webpage at http://opentrees.org is also here.

## Dependencies

sudo apt-get install -y wget gdal-bin jq

## How to use

1. gettrees.sh: download a number of individual datasets
2. loadtrees-db.sh: load each dataset into its own PostGIS table
3. mergetrees.sql: extract data from fields into standard schema
4. cleantrees.sql: fix up all kinds of data errors

## How to set up PGREST 

PGREST provides a lookup service for data.

wget 'https://github.com/begriffs/postgrest/releases/download/v0.2.10.0/postgrest-0.2.10.0-linux.tar.xz'
tar xf postgrest*.xz

sudo -u postgres createuser readtrees

sudo -u postgres psql -d trees <<EOF
alter user readtrees with password 'angpohora';

EOF

# Add this to pg_hba.conf
# host trees readtrees 127.0.0.1/32 md5

nohup ./postgrest-0.2.10.0 -d trees -U readtrees --db-pass angpohora -a readtrees &

## Author
All code (so far) written by Steve Bennett (stevage@gmail.com, stevebennett.me, @stevage1)

All code released under Creative Commons Attribution (CC-BY 3.0 AU)