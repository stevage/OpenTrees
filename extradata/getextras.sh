wget -O evergreen.csv 'http://datadryad.org/bitstream/handle/10255/dryad.59005/GlobalLeafPhenologyDatabase.csv?sequence=1'
wget -O woodiness.csv 'http://datadryad.org/bitstream/handle/10255/dryad.59002/GlobalWoodinessDatabase.csv?sequence=1'
wget -O genera.csv 'http://datadryad.org/bitstream/handle/10255/dryad.59001/Spermatophyta_Genera.csv?sequence=2'

wget -O endemicplants.csv 'http://biocache.ala.org.au/ws/explore/endemic/species.csv?q=kingdom:Plantae&wkt=POLYGON%20((113.203125%20-20.46818922264095,%20131.572265625%20-10.22843726615593,%20142.11914062499997%20-10.314919285813147,%20155.7421875%20-25.244695951306028,%20153.369140625%20-34.37971258046219,%20150.46875%20-38.95940879245422,%20148.18359375%20-45.02695045318544,%20113.818359375%20-35.101934057246055,%20110.654296875%20-24.04646399966658,%20113.203125%20-20.46818922264095))'

# pip install csvkit

DB="postgresql://ubuntu:ubuntu@localhost:5432/trees"


csvsql --db $DB --insert --blanks --no-constraints --no-inference woodiness.csv
csvsql --db $DB --insert --blanks --no-constraints --no-inference evergreen.csv
csvsql --db $DB --insert --blanks --no-constraints --no-inference genera.csv

