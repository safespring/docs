#!/usr/bin/env python3
"""Validate a local MkDocs build without network access or publication.

The artifact checks follow the production design build profile. Download ZIPs
assembled separately by the server are deliberately outside this source check.
"""

import argparse
import gzip
from html.parser import HTMLParser
import json
from pathlib import Path
import ssl
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET
import zlib


CANONICAL = "https://docs.safespring.com/"
EXCLUDED_SLUG = "inline-code-spacing-test"
SITEMAP_NAMESPACE = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
REQUIRED_FILES = (
    "index.html",
    "404.html",
    "search/search_index.json",
    "sitemap.xml",
    "sitemap.xml.gz",
)


class ValidationError(ValueError):
    """A build artifact does not meet the publication contract."""


def require(condition, message):
    if not condition:
        raise ValidationError(message)


class PageFacts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.html = False
        self.canonical = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.html = True
        if tag == "link" and "canonical" in (attrs.get("rel") or "").split():
            self.canonical.append(attrs.get("href"))


def local_target(site, location, *, sitemap=False):
    """Resolve a URL to a regular output file, allowing search anchor entries."""
    require(isinstance(location, str), "URL location must be a string")
    require(not any(ord(char) < 32 for char in location), "control character in URL")
    parts = urlsplit(location)
    if sitemap:
        require(
            location.startswith(CANONICAL) and not parts.query and not parts.fragment,
            "non-production sitemap URL: " + location,
        )
    else:
        require(
            not parts.scheme and not parts.netloc and not parts.query,
            "search URL must be local: " + location,
        )
    relative = unquote(parts.path).lstrip("/")
    require(EXCLUDED_SLUG not in relative, "excluded test route in URL: " + location)
    require(
        "\\" not in relative and "\x00" not in relative
        and all(part not in (".", "..") for part in relative.split("/")),
        "unsafe local URL: " + location,
    )
    if not relative or relative.endswith("/"):
        relative += "index.html"
    target = site / relative
    require(target.resolve().is_relative_to(site), "URL escapes output: " + location)
    require(target.is_file() and target.stat().st_size > 0, "missing URL target: " + location)
    return target


def validate_output(site):
    site = Path(site)
    require(not site.is_symlink(), "output directory is a symlink")
    require(site.is_dir(), "output directory does not exist")
    site = site.resolve()
    files = []
    for path in site.rglob("*"):
        require(not path.is_symlink(), "output symlink: " + str(path.relative_to(site)))
        require(path.is_dir() or path.is_file(), "non-regular output: " + str(path.relative_to(site)))
        require(EXCLUDED_SLUG not in str(path.relative_to(site)), "excluded test route was emitted")
        if path.is_file():
            files.append(path)
            require(
                EXCLUDED_SLUG.encode() not in path.read_bytes(),
                "excluded test route referenced in " + str(path.relative_to(site)),
            )
    for relative in REQUIRED_FILES:
        path = site / relative
        require(path.is_file() and path.stat().st_size > 0, "missing or empty output: " + relative)

    homepage = PageFacts()
    homepage.feed((site / "index.html").read_text(encoding="utf-8"))
    require(homepage.html and homepage.canonical == [CANONICAL], "invalid homepage or canonical URL")

    xml = (site / "sitemap.xml").read_bytes()
    require(gzip.decompress((site / "sitemap.xml.gz").read_bytes()) == xml, "sitemap gzip differs")
    sitemap = ET.fromstring(xml)
    require(sitemap.tag == SITEMAP_NAMESPACE + "urlset", "invalid sitemap root")
    locations = []
    for entry in sitemap:
        require(entry.tag == SITEMAP_NAMESPACE + "url", "invalid sitemap entry")
        loc = entry.findall(SITEMAP_NAMESPACE + "loc")
        require(len(loc) == 1 and loc[0].text, "missing or duplicate sitemap location")
        locations.append(loc[0].text)
    require(locations and len(locations) == len(set(locations)), "empty or duplicate sitemap URLs")
    for location in locations:
        local_target(site, location, sitemap=True)

    index = json.loads((site / "search/search_index.json").read_text(encoding="utf-8"))
    require(isinstance(index, dict), "search index must be an object")
    entries = index.get("docs")
    require(isinstance(entries, list) and entries, "empty or invalid search index")
    for entry in entries:
        require(isinstance(entry, dict) and "location" in entry, "invalid search entry")
        local_target(site, entry["location"])

    # Public PEM downloads must contain certificates that OpenSSL can parse.
    # This does not test expiry or trust and makes no network connection.
    for path in files:
        if path.suffix.lower() == ".pem":
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            context.load_verify_locations(cadata=path.read_text(encoding="ascii"))

    return {
        "html_files": sum(path.suffix == ".html" for path in files),
        "search_entries": len(entries),
        "sitemap_urls": len(locations),
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-dir", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        result = validate_output(args.site_dir)
    except (OSError, ValueError, ET.ParseError, EOFError, zlib.error) as error:
        print("Docs build validation failed: " + str(error), file=sys.stderr)
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
