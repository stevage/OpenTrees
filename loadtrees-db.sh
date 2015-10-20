DBNAME=trees
TABLE=trees
function showcount() {
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
"psql -d $DBNAME -c \"select concat(count(*), ' trees $total') from \(.id);\" | grep 'trees'"
EOF
)

#"showcount \(.id)"
jq -r "$JQ" sources.json > generated-load.sh
pushd data
bash ../generated-load.sh
popd


#echo "Loading datavic's VBA low-medium accuracy flora. This is big."
#ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" /mnt/guru/datavic/vba_flora100.shp -nln flora100 $TABLEOPTIONS

#echo "Loading datavic's VBA high accuracy flora. This is freaking massive."
#ogr2ogr --config PG_USE_COPY YES -overwrite -f "PostgreSQL" PG:"dbname=$DBNAME" /mnt/guru/datavic/vba_flora25.shp -nln flora25 $TABLEOPTIONS
