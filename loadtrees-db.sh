DBNAME=trees
TABLE=trees
export function showcount() {
  t=$TABLE
  total=" in total."
  if [[ -n "$1" ]]; then
    t=$1
    total=""
  fi
  psql -d $DBNAME -c "select concat(count(*), ' trees $total') from $t;" | grep 'trees'
}
export -f showcount
date
TABLEOPTS="--config PG_USE_COPY YES -overwrite -f PostgreSQL PG:'dbname=$DBNAME' -skipfailures"
LAYEROPTS="-lco GEOMETRY_NAME=the_geom -lco FID=gid -nlt GEOMETRY -t_srs EPSG:3857"

export JQ=$(cat <<EOF
.[]|
"echo Loading \(.id)",
"ogr2ogr $TABLEOPTS \(.filename//"\(.id).\(.format)") -nln \(.id) $LAYEROPTS \(.gdal_options//"")",
"showcount \(.id)"
EOF
)
eval `jq -r "$JQ" sources.json`


echo "Loading datavic's VBA low-medium accuracy flora. This is big."
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" /mnt/guru/datavic/vba_flora100.shp -nln flora100 $TABLEOPTIONS

echo "Loading datavic's VBA high accuracy flora. This is freaking massive."
ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" /mnt/guru/datavic/vba_flora25.shp -nln flora25 $TABLEOPTIONS

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
rm alltrees-tmp.csv
tar -czvf alltrees.tar.gz alltrees.csv

date
