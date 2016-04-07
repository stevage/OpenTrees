wget -O evergreen.csv 'http://datadryad.org/bitstream/handle/10255/dryad.59005/GlobalLeafPhenologyDatabase.csv?sequence=1'
wget -O woodiness.csv 'http://datadryad.org/bitstream/handle/10255/dryad.59002/GlobalWoodinessDatabase.csv?sequence=1'
wget -O genera.csv 'http://datadryad.org/bitstream/handle/10255/dryad.59001/Spermatophyta_Genera.csv?sequence=2'

wget -O ausplants.csv 'http://biocache.ala.org.au/ws/explore/endemic/species.csv?q=kingdom:Plantae&wkt=POLYGON%20((113.203125%20-20.46818922264095,%20131.572265625%20-10.22843726615593,%20142.11914062499997%20-10.314919285813147,%20155.7421875%20-25.244695951306028,%20153.369140625%20-34.37971258046219,%20150.46875%20-38.95940879245422,%20148.18359375%20-45.02695045318544,%20113.818359375%20-35.101934057246055,%20110.654296875%20-24.04646399966658,%20113.203125%20-20.46818922264095))'

wget -O vicplants.csv 'http://biocache.ala.org.au/ws/explore/endemic/species.csv?q=kingdom:Plantae&wkt=POLYGON ((140.95458984375 -38.11727165830541, 140.95458984375 -34.016241889667015, 142.14111328125 -34.125447565116126, 143.26171875 -34.81380331711314, 143.94287109374997 -35.56798045801208, 144.7998046875 -36.120127589781454, 145.26123046875 -35.78217070326606, 147.3486328125 -36.03133177633187, 147.91992187499997 -35.96022296929668, 148.29345703124997 -36.73888412439431, 150.0732421875 -37.5097258429375, 146.77734375 -39.40224434029276, 141.240234375 -38.788345355085625, 140.95458984375 -38.11727165830541))'

# pip install csvkit

DB="postgresql://ubuntu:ubuntu@localhost:5432/trees"

csvsql --db $DB --insert --blanks --no-constraints --no-inference ausplants.csv
csvsql --db $DB --insert --blanks --no-constraints --no-inference vicplants.csv

csvsql --db $DB --insert --blanks --no-constraints --no-inference woodiness.csv
csvsql --db $DB --insert --blanks --no-constraints --no-inference evergreen.csv
csvsql --db $DB --insert --blanks --no-constraints --no-inference genera.csv

