TODO:
- further contemplate using sqlite instead of Postgresql
- somehow make existing SQL scripts work

Looks like spatilite can work but need to call it directly instead of through ogr2ogr

spatialite_tool -i -shp prov2010_s -d db.sqlite -t counties -c CP1252 -s 23032

https://www.gaia-gis.it/gaia-sins/spatialite-cookbook/html/impexp.html
