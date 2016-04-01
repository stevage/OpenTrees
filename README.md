# opentrees.org

This repository contains scripts to fetch trees datasets for various councils in Victoria and load it into a database. It also contains a simple static website with a map of all the trees. This requires TileMill running server-side.

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