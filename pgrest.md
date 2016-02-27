### How to set up PGrest

wget 'https://github.com/begriffs/postgrest/releases/download/v0.2.10.0/postgrest-0.2.10.0-linux.tar.xz'
tar xf postgrest*.xz

sudo -u postgres createuser readtrees

sudo -u postgres psql -d trees <<EOF
alter user readtrees with password 'angpohora';

EOF

# Add this to pg_hba.conf
# host trees readtrees 127.0.0.1/32 md5

nohup ./postgrest-0.2.10.0 -d trees -U readtrees --db-pass angpohora -a readtrees &