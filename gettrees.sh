#!/bin/bash
# createdb -T template_gis trees
#colac_otways='http://data.gov.au/dataset/3ce1805b-cb81-4683-8f46-e7bd2d2a3b7c/resource/bcf1d62b-9e72-4eca-b183-418f83dedcea/download/costreesopendata.csv'
#corangamite='https://data.gov.au/dataset/corangamite-shire-trees/resource/0af57b1a-a5ea-4d3a-b910-6c3b3cb37a12'
#colac_otways='http://data.gov.au/geoserver/colac-otway-shire-trees/wfs?request=GetFeature&typeName=3ce1805b_cb81_4683_8f46_e7bd2d2a3b7c&outputFormat=json';
#coranagmite='http://data.gov.au/geoserver/corangamite-shire-trees/wfs?request=GetFeature&typeName=d9677ebb_f3db_45f3_88eb_04089debb9e0&outputFormat=json';
wget -O corangamite.geojson 'http://data.gov.au/geoserver/corangamite-shire-trees/wfs?request=GetFeature&typeName=d9677ebb_f3db_45f3_88eb_04089debb9e0&outputFormat=json'
wget -O colac_otways.geojson 'http://data.gov.au/geoserver/colac-otway-shire-trees/wfs?request=GetFeature&typeName=3ce1805b_cb81_4683_8f46_e7bd2d2a3b7c&outputFormat=json'
#wget -O wyndham.geojson 'http://data.gov.au/geoserver/wyndham-city-trees/wfs?request=GetFeature&typeName=57bca56b_1b4c_48fa_824d_1b4b5cbf7ce7&outputFormat=json'
wget -O wyndham.csv 'http://data.gov.au/geoserver/wyndham-city-trees/wfs?request=GetFeature&typeName=57bca56b_1b4c_48fa_824d_1b4b5cbf7ce7&outputFormat=csv'
# Get rid of stupid columns
csvcut -c 3,5,9,10 wyndham.csv > wyndham-cut.csv


wget -O ballarat.geojson 'http://data.gov.au/geoserver/ballarattrees/wfs?request=GetFeature&typeName=eabaee3f_a563_449b_a04a_1ec847566ea1&outputFormat=json'
wget -O manningham.geojson 'http://data.gov.au/geoserver/manningham-streettrees/wfs?request=GetFeature&typeName=1aef5123_24ff_4084_a0f1_a52ca71e9e99&outputFormat=json'
wget -O geelong.geojson 'http://data.gov.au/geoserver/geelong-trees/wfs?request=GetFeature&typeName=13b1196c_7fb7_436a_86bc_ab24c16526de&outputFormat=json'
wget -O melbourne.csv 'https://data.melbourne.vic.gov.au/api/views/8reg-ju2w/rows.csv?accessType=DOWNLOAD'
