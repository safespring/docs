"""Check shared FAQ includes using the production wrappers and theme templates."""

from html.parser import HTMLParser
import gzip
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

import yaml


SOURCE = Path(__file__).resolve().parents[1]
SITE_URL = "https://docs.safespring.com/"
SERVICES = ("compute", "storage", "kubernetes", "backup")


class Element:
    def __init__(self, tag, attrs=(), parent=None):
        self.tag = tag
        self.attrs = dict(attrs)
        self.parent = parent
        self.children = []

    def all(self, tag=None, **attrs):
        found = []
        if (tag is None or self.tag == tag) and all(
            self.attrs.get(name) == value for name, value in attrs.items()
        ):
            found.append(self)
        for child in self.children:
            if isinstance(child, Element):
                found.extend(child.all(tag, **attrs))
        return found

    def text(self):
        return "".join(
            child.text() if isinstance(child, Element) else child
            for child in self.children
        )


class Document(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.current = self.root
        self.feed(path.read_text(encoding="utf-8"))
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in self.VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        node = self.current
        while node.parent is not None:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, data):
        self.current.children.append(data)


class FaqIncludesTests(unittest.TestCase):
    def fixture(self, *, directory_urls=True):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        root = Path(directory.name)
        docs = root / "docs"
        docs.mkdir()

        def write(relative, content):
            path = docs / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

        write("safespring.css", "body { color: #123; }\n")
        write("index.md", "# Home\n")
        write("support.md", "# Support\n\nContact information.\n")
        write("faq.md", "---\nhide:\n  - footer\n---\n\n# FAQ overview\n\n" + "\n".join(
            f"- [{service.title()}](faq/{service}.md)"
            for service in SERVICES
        ))

        nav = [{"Home": "index.md"}]
        for service in SERVICES:
            title = service.title()
            write(f"{service}/faq.md", (
                f"# {title} FAQ\n\n## Connection\n\n"
                f"{title} original answer.\n\n"
                "[Local guide](guide.md#guide)\n\n"
                "![Diagram](images/diagram.svg)\n\n"
                "[Support](../support.md#support)\n\n"
                "[This answer](#connection)\n\n"
                "[Reference guide][guide]\n\n"
                "[guide]: guide.md#guide\n"
            ))
            write(f"faq/{service}.md", (SOURCE / f"content/faq/{service}.md").read_text())
            write(f"{service}/guide.md", "# Guide\n\nService guide.\n")
            write(f"{service}/images/diagram.svg", (
                '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'
            ))
            nav.append({title: [
                {"FAQ": f"{service}/faq.md"},
                {"Guide": f"{service}/guide.md"},
            ]})
        nav.append({"Support": "support.md"})
        nav.append({"FAQ": [
            {"Overview": "faq.md"},
            *[{service.title(): f"faq/{service}.md"}
              for service in SERVICES],
        ]})
        config = {
            "site_name": "FAQ fixture", "site_url": SITE_URL,
            "docs_dir": "docs", "site_dir": "site",
            "use_directory_urls": directory_urls,
            "repo_url": "https://github.com/safespring/docs",
            "edit_uri": "edit/master/content/",
            "theme": {"name": "material", "font": False,
                      "custom_dir": str(SOURCE / "overrides"),
                      "features": ["navigation.tabs", "navigation.footer"]},
            "plugins": ["search", "include-markdown"],
            "hooks": [str(SOURCE / "hooks/legacy_tabbed_fences.py")],
            "nav": nav,
        }
        (root / "mkdocs.yml").write_text(yaml.safe_dump(config, sort_keys=False))
        return root

    def build(self, root, *, succeeds=True):
        result = subprocess.run(
            [sys.executable, "-B", "-m", "mkdocs", "build", "--strict", "--clean"],
            cwd=root, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            timeout=45,
        )
        if succeeds:
            self.assertEqual(result.returncode, 0, result.stdout)
        else:
            self.assertNotEqual(result.returncode, 0, result.stdout)
        return result.stdout

    def page(self, root, path, *, directory_urls=True):
        file_path = path + "/index.html" if directory_urls else path + ".html"
        return Document(root / "site" / file_path).root

    def page_url(self, path, directory_urls):
        return SITE_URL + path + ("/" if directory_urls else ".html")

    def link(self, article, label):
        return next(a.attrs["href"] for a in article.all("a")
                    if re.sub(r"\s+", " ", a.text()).strip() == label)

    def footer(self, document, direction, page_url):
        links = [a for a in document.all("a")
                 if f"md-footer__link--{direction}" in a.attrs.get("class", "").split()]
        self.assertLessEqual(len(links), 1)
        return urljoin(page_url, links[0].attrs["href"]) if links else None

    def footer_hidden(self, document):
        navs = [nav for nav in document.all("nav")
                if "md-footer__inner" in nav.attrs.get("class", "").split()]
        self.assertEqual(len(navs), 1)
        return "hidden" in navs[0].attrs

    def active_section(self, document):
        for nav in document.all("nav", **{"data-md-level": "1"}):
            if "md-nav__item--active" in nav.parent.attrs.get("class", "").split():
                labels = [label for label in nav.all("label")
                          if "md-nav__title" in label.attrs.get("class", "").split()]
                return re.sub(r"\s+", " ", labels[0].text()).strip()
        self.fail("No active top-level navigation section found")

    def test_shared_content_has_independent_navigation_and_one_canonical_index(self):
        for directory_urls in (True, False):
            with self.subTest(directory_urls=directory_urls):
                root = self.fixture(directory_urls=directory_urls)
                self.build(root)
                for service in SERVICES:
                    canonical = self.page_url(f"{service}/faq", directory_urls)
                    alias = self.page_url(f"faq/{service}", directory_urls)
                    original = self.page(root, f"{service}/faq", directory_urls=directory_urls)
                    collection = self.page(root, f"faq/{service}", directory_urls=directory_urls)
                    self.assertEqual(self.active_section(original), service.title())
                    self.assertEqual(self.active_section(collection), "FAQ")
                    for document, url in ((original, canonical), (collection, alias)):
                        article = document.all("article")[0]
                        self.assertIn(f"{service.title()} original answer.", article.text())
                        self.assertEqual(
                            [link.attrs["href"] for link in document.all("link", rel="canonical")],
                            [canonical],
                        )
                        edit = "https://github.com/safespring/docs/edit/master/content/" + service + "/faq.md"
                        self.assertIn(edit, [a.attrs.get("href") for a in document.all("a")])
                        self.assertEqual(urljoin(url, self.link(article, "Local guide")),
                                         self.page_url(f"{service}/guide", directory_urls) + "#guide")
                        self.assertEqual(urljoin(url, self.link(article, "Reference guide")),
                                         self.page_url(f"{service}/guide", directory_urls) + "#guide")
                        self.assertEqual(urljoin(url, self.link(article, "Support")),
                                         self.page_url("support", directory_urls) + "#support")
                        self.assertEqual(self.link(article, "This answer"), "#connection")
                        self.assertEqual(
                            urljoin(url, article.all("img", alt="Diagram")[0].attrs["src"]),
                            SITE_URL + service + "/images/diagram.svg",
                        )
                    self.assertEqual(self.footer(original, "next", canonical),
                                     self.page_url(f"{service}/guide", directory_urls))
                    self.assertFalse(self.footer_hidden(original))
                    self.assertTrue(self.footer_hidden(collection))

                overview = self.page(root, "faq", directory_urls=directory_urls)
                self.assertTrue(self.footer_hidden(overview))

                index = json.loads((root / "site/search/search_index.json").read_text())
                locations = [entry["location"] for entry in index["docs"]]
                alias_paths = {
                    f"faq/{service}" + ("/" if directory_urls else ".html")
                    for service in SERVICES
                }
                self.assertFalse(any(location.split("#", 1)[0] in alias_paths
                                     for location in locations))
                for service in SERVICES:
                    expected = f"{service}/faq" + ("/" if directory_urls else ".html")
                    self.assertIn(expected, locations)
                xml = (root / "site/sitemap.xml").read_bytes()
                locations = [node.text for node in ET.fromstring(xml).iter(
                    "{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
                self.assertEqual(len(locations), len(set(locations)))
                self.assertFalse(set(locations) & {SITE_URL + path for path in alias_paths})
                for service in SERVICES:
                    self.assertEqual(locations.count(self.page_url(f"{service}/faq", directory_urls)), 1)
                self.assertEqual(gzip.decompress((root / "site/sitemap.xml.gz").read_bytes()), xml)

    def test_editing_the_original_updates_both_views(self):
        root = self.fixture()
        self.build(root)
        original = root / "docs/backup/faq.md"
        wrapper = root / "docs/faq/backup.md"
        wrapper_before = wrapper.read_text()
        original.write_text(original.read_text().replace("Backup original answer.", "Backup revised answer."))
        self.build(root)
        for path in ("backup/faq", "faq/backup"):
            text = self.page(root, path).all("article")[0].text()
            self.assertIn("Backup revised answer.", text)
            self.assertNotIn("Backup original answer.", text)
        self.assertEqual(wrapper.read_text(), wrapper_before)

    def test_missing_source_fails_the_build(self):
        root = self.fixture()
        (root / "docs/backup/faq.md").unlink()
        output = self.build(root, succeeds=False)
        self.assertIn("backup/faq", output)


if __name__ == "__main__":
    unittest.main()
