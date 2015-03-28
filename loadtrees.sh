DBNAME=gis
TABLE=trees

psql -d $DBNAME -c "drop table $TABLE;"
echo "Loading melbourne.csv"
ogr2ogr -f "PostgreSQL" -lco GEOMETRY_NAME=the_geom -lco FID=gid PG:"dbname=$DBNAME" melbourne.vrt -nln $TABLE -nlt GEOMETRY #MULTIPOINT
psql -d $DBNAME -c "select count(*) from $TABLE;"
echo "Loading wyndham-cut.csv"
ogr2ogr -f "PostgreSQL" -append -lco GEOMETRY_NAME=the_geom -lco FID=gid PG:"dbname=$DBNAME" wyndham.vrt -nln $TABLE -nlt GEOMETRY #MULTIPOINT
psql -d $DBNAME -c "select count(*) from $TABLE;"

# Load Wyndham trees via WFS. Their other exports are a bit broken.
#ogr2ogr -f PostgreSQL PG:"dbname=trees" -append -nln trees "WFS:http://data.gov.au/geoserver/wyndham-city-trees/wfs?version=2.0.0&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=wyndham-city-trees:57bca56b_1b4c_48fa_824d_1b4b5cbf7ce7"

append="-append"

#TODO corangamite has projected coords, with lat/long specified as "properties".
for file in *.geojson; do
echo "Loading $file"
ogr2ogr -f "PostgreSQL" PG:"dbname=$DBNAME" $file $append -nln $TABLE
psql -d $DBNAME -c "select count(*) from $TABLE;"
append="-append "
done
