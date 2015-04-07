DBNAME=trees
TABLE=trees
TABLEOPTIONS="-lco GEOMETRY_NAME=the_geom -lco FID=gid -nlt GEOMETRY"
function showcount() {
  t=$TABLE
  total=" in total."
  if [[ -n "$1" ]]; then
    t=$1
    total=""
  fi
  psql -d $DBNAME -c "select concat(count(*), ' trees $total') from $t;" | grep 'trees'
}

date
psql -d $DBNAME -c "drop table $TABLE;"
echo "Loading melbourne.csv"
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 melbourne.vrt -nln melbourne $TABLEOPTIONS
showcount melbourne
echo "Loading wyndham-cut.csv"
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 wyndham.vrt -nln wyndham $TABLEOPTIONS
showcount wyndham
echo "Loading adelaide.csv. (Expect two 'tolerance' errors due to missing data.)"
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 adelaide.vrt -nln adelaide -skipfailures $TABLEOPTIONS


# Load Wyndham trees via WFS. Their other exports are a bit broken.
#ogr2ogr -f PostgreSQL PG:"dbname=trees" -append -nln trees "WFS:http://data.gov.au/geoserver/wyndham-city-trees/wfs?version=2.0.0&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=wyndham-city-trees:57bca56b_1b4c_48fa_824d_1b4b5cbf7ce7"

for file in *.geojson; do
echo "Loading $file"
ogr2ogr --config PG_USE_COPY YES -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 $file -overwrite $TABLEOPTIONS -nln ${file/.geojson}
showcount ${file/.geojson}
done

echo "Loading waite_arboretum.zip"
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 WaiteTreeID_2014_App_Joined_19062014.shp -nln waite $TABLEOPTIONS
showcount waite

echo "Merging all trees into one table."
psql -d $DBNAME -f mergetrees.sql
showcount alltrees

echo "Cleaning and processing merged trees."
psql -d $DBNAME -f cleantrees.sql

echo "Making species interestingness table."
psql -d $DBNAME -f makespecies.sql

echo "Setting lat/lon for ease of use."
# Using xmin/ymin deals with multipoints
psql -d $DBNAME -c 'UPDATE alltrees SET lon=st_xmin(st_transform(the_geom,4674)),lat=st_ymin(st_transform(the_geom,4674))'

echo "Dumping all data to disk and zipping as alltrees.tar.gz"
psql -d $DBNAME -c "\copy alltrees to 'alltrees-tmp.csv' csv header"
csvcut -C 3 < alltrees-tmp.csv > alltrees.csv
tar -czvf alltrees.tar.gz alltrees.csv

date
