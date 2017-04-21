#/bin/bash -x
docker run --rm -it -p 8000:8000 -v ${PWD}:/docs:z squidfunk/mkdocs-material
