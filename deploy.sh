mkdir -p docs
rm -rf docs/*
cp -pr dist/* docs/
git add docs/*
git commit -m 'Update'
git push