# Safespring services documentation

This is the source that generates the Safespring documentation site at
https://docs.safespring.com

The content is written by Safespring and community contributors.

## Building

To view a build of the site, run
```
docker run --rm -it -p 8000:8000 -v $PWD:/docs:z squidfunk/mkdocs-material
```
and open http://localhost:8000 in your favorite browser

## Spellchecking

We make use of [pyspelling](https://facelessuser.github.io/pyspelling/):

```bash
pip install pyspelling
pyspelling
```

Modify `.pyspelling.yml` for configuration and `.github/config/.wordlist.txt` for adjusting configuration.

## Contributions

We're open to contributions from anyone. If you need help trying to add or
change anything we got some [documentation for writing documentation][cd], too.

## License

The content of this repository is licensed under a  [Creative Commons BY-SA 4.
0][ccbysa4] license.

[![CC-BY-SA-4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)][ccbysa4]

[cd]:https://docs.safespring.com/contribute/
[ccbysa4]:http://creativecommons.org/licenses/by-sa/4.0/
