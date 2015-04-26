#!/bin/bash
# createdb -T template_gis trees
jq -r ".[]|\"wget -O data/\(.id).\(.format) '\(.download)'\"" sources.json | bash

#for source in `jq -r 'keys[]' sources.json`; do
#  wget -O ${source}.`jq -r .${source}.format` `jq -r .${source}.download sources.json`
#  jq -r 
#done 
cd data
# Get rid of stupid columns
csvcut -c 3,5,9,10 wyndham.csv > wyndham-cut.csv

unzip *.zip # Just waite for now
#mv WaiteTreeID_2014_App_Joined_19062014.shp waite.shp

cd ..
#jq 'map(if .id=="waite" then .format="shp" else . end)' sources.json > sources2.json


