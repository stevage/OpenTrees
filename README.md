# opentrees.org

This repository contains mostly scripts to fetch trees datasets for various councils in Victoria and load it into a database. 

The source code for the webpage at http://opentrees.org is also here.

1. gettrees.sh: download a number of individual datasets
2. loadtrees-db.sh: load each dataset into its own PostGIS table
3. mergetrees.sql: extract data from fields into standard schema
4. cleantrees.sql: fix up all kinds of data errors
