# Safespring services documentation

This is the source that generates the Safespring documentation site at
https://docs.safespring.com

The content is written by Safespring and community contributors.

## Building

To view a build of the site with Docker, run
```
docker run --rm -it -p 8000:8000 -v "$PWD:/docs" -w /docs python:3.12-slim \
  sh -c 'pip install -r requirements.lock && mkdocs serve --dev-addr 0.0.0.0:8000'
```
and open http://localhost:8000 in your favorite browser

Alternatively, use Python 3.12 with the locked dependencies:

```bash
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.lock
mkdocs serve
```

Edit `content/safespring.css` as readable source. The build reduces the generated
CSS file size and adds its content hash to the CSS URL, including local previews.

## FAQ collection

Each service FAQ is maintained only in `content/<service>/faq.md`. Its primary
page remains at `/<service>/faq/`. The FAQ collection displays that same source
at `/faq/<service>/`, with its own sidebar. Use that sidebar to browse the
collection; its global previous/next footer links are hidden.

The installed `mkdocs-include-markdown-plugin` includes each original in a small
wrapper under `content/faq/`, for example:

```markdown
---
faq_source: backup/faq.md
search:
  exclude: true
hide:
  - footer
---

{% include-markdown "../backup/faq.md" %}
```

Edit questions and answers only in the service source. The plugin rewrites
relative Markdown links and images for the collection URL. Its wrappers are
ordinary pages listed under FAQ in `mkdocs.yml`; no custom Python generates them.
`faq_source` lets the theme use the original service's canonical and edit URLs.
Collection wrappers are excluded from search through their metadata and from the
sitemap through `overrides/sitemap.xml`. New services need a wrapper and a FAQ
navigation entry, with `faq_source` and the include pointing to the same original.

Run the integration checks with:

```bash
python -B -m unittest discover -s tests -p 'test_faq_includes.py' -v
```

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
