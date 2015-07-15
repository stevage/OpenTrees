#!/bin/bash
jq -r ".[]|\"wget -O data/\(.id).\(.format) '\(.download)'\"" sources.json | bash

#for source in `jq -r 'keys[]' sources.json`; do
#  wget -O ${source}.`jq -r .${source}.format` `jq -r .${source}.download sources.json`
#  jq -r 
#done 
cd data
# Get rid of stupid columns
csvcut -c 3,5,9,10 wyndham.csv > wyndham-cut.csv

unzip *.zip # Just waite for now

cd ..

