DBNAME=trees
TABLE=trees
TABLEOPTIONS="-lco GEOMETRY_NAME=the_geom -lco FID=gid -nlt GEOMETRY"
function showcount() {
  t=$TABLE
  if [[ -n "$1" ]]; then
    t=$1
  fi
  psql -d $DBNAME -c "select concat(count(*), ' trees total.') from $t;" | grep 'trees'
}

date

#psql -d $DBNAME -c "drop table $TABLE;"
echo "Loading melbourne.csv"
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 melbourne.vrt -nln melbourne $TABLEOPTIONS
showcount melbourne
echo "Loading wyndham-cut.csv"
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 wyndham.vrt -nln wyndham $TABLEOPTIONS
showcount wyndham


# Load Wyndham trees via WFS. Their other exports are a bit broken.
#ogr2ogr -f PostgreSQL PG:"dbname=trees" -append -nln trees "WFS:http://data.gov.au/geoserver/wyndham-city-trees/wfs?version=2.0.0&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=wyndham-city-trees:57bca56b_1b4c_48fa_824d_1b4b5cbf7ce7"

for file in *.geojson; do
echo "Loading $file"
ogr2ogr --config PG_USE_COPY YES -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 $file -overwrite $TABLEOPTIONS -nln ${file/.geojson}
showcount ${file/.geojson}
done
psql -d $DBNAME -f mergetrees.sql
showcount
date
