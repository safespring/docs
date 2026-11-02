"""Regression checks for invalid artifacts that a successful build can emit."""

from contextlib import redirect_stderr
import gzip
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest


SPEC = importlib.util.spec_from_file_location(
    "validate_docs_build", Path(__file__).resolve().parents[1] / "scripts/validate_docs_build.py"
)
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class BuildValidationTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.site = Path(self.directory.name)
        self.write("index.html", '<html><link rel="canonical" href="https://docs.safespring.com/"></html>')
        self.write("404.html", "<html>Not found</html>")
        self.write("guide/index.html", '<html><h1 id="start">Guide</h1></html>')
        self.search(["", "#overview", "guide/", "guide/#start"])
        self.sitemap([validator.CANONICAL, validator.CANONICAL + "guide/"])

    def write(self, relative, text):
        path = self.site / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    def search(self, locations):
        self.write("search/search_index.json", json.dumps({"docs": [{"location": loc} for loc in locations]}))

    def sitemap(self, locations):
        xml = ('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
               + "".join("<url><loc>" + loc + "</loc></url>" for loc in locations)
               + "</urlset>").encode()
        (self.site / "sitemap.xml").write_bytes(xml)
        (self.site / "sitemap.xml.gz").write_bytes(gzip.compress(xml))

    def test_valid_source_build_needs_no_server_assembled_zip(self):
        self.assertEqual(validator.validate_output(self.site), {
            "html_files": 3, "search_entries": 4, "sitemap_urls": 2,
        })

    def test_missing_and_empty_required_outputs_fail(self):
        for relative in validator.REQUIRED_FILES:
            with self.subTest(relative=relative):
                path = self.site / relative
                original = path.read_bytes()
                path.unlink()
                with self.assertRaisesRegex(validator.ValidationError, "missing or empty"):
                    validator.validate_output(self.site)
                path.touch()
                with self.assertRaisesRegex(validator.ValidationError, "missing or empty"):
                    validator.validate_output(self.site)
                path.write_bytes(original)

    def test_wrong_or_duplicate_homepage_canonical_fails(self):
        for links in (
            '<link rel="canonical" href="https://preview.invalid/">',
            '<link rel="canonical" href="https://docs.safespring.com/">' * 2,
        ):
            with self.subTest(links=links):
                self.write("index.html", "<html>" + links + "</html>")
                with self.assertRaisesRegex(validator.ValidationError, "canonical"):
                    validator.validate_output(self.site)

    def test_invalid_sitemap_urls_fail(self):
        for locations in (
            [], [validator.CANONICAL, validator.CANONICAL],
            ["https://preview.invalid/"], [validator.CANONICAL + "missing/"],
            [validator.CANONICAL + "?preview=1"], [validator.CANONICAL + "#fragment"],
            [validator.CANONICAL + "%2e%2e/outside.html"],
        ):
            with self.subTest(locations=locations):
                self.sitemap(locations)
                with self.assertRaises(validator.ValidationError):
                    validator.validate_output(self.site)

    def test_mismatched_compressed_sitemap_fails(self):
        (self.site / "sitemap.xml.gz").write_bytes(gzip.compress(b"different"))
        with self.assertRaisesRegex(validator.ValidationError, "gzip differs"):
            validator.validate_output(self.site)

    def test_malformed_artifacts_fail_with_a_readable_cli_error(self):
        for relative, data in (
            ("search/search_index.json", b"{broken"),
            ("sitemap.xml", b"<broken"),
            ("sitemap.xml.gz", b"\x1f\x8b\x08\x00" + b"\x00" * 6 + b"\xff" * 8),
        ):
            with self.subTest(relative=relative):
                path = self.site / relative
                original = path.read_bytes()
                compressed = (self.site / "sitemap.xml.gz").read_bytes()
                path.write_bytes(data)
                if relative == "sitemap.xml":
                    (self.site / "sitemap.xml.gz").write_bytes(gzip.compress(data))
                stderr = io.StringIO()
                with redirect_stderr(stderr):
                    self.assertEqual(validator.main(["--site-dir", str(self.site)]), 1)
                self.assertIn("Docs build validation failed:", stderr.getvalue())
                path.write_bytes(original)
                (self.site / "sitemap.xml.gz").write_bytes(compressed)

    def test_search_must_have_entries_with_existing_local_targets(self):
        for entries in ([], [None], [{}], [{"location": 42}], [{"location": "missing/"}],
                        [{"location": "https://example.com/"}], [{"location": "//example.com/"}],
                        [{"location": "%2e%2e/outside.html"}]):
            with self.subTest(entries=entries):
                self.write("search/search_index.json", json.dumps({"docs": entries}))
                with self.assertRaises(validator.ValidationError):
                    validator.validate_output(self.site)

    def test_excluded_route_cannot_reappear_in_output_or_links(self):
        relative = "compute/howto/inline-code-spacing-test/index.html"
        self.write(relative, "<html>Test</html>")
        with self.assertRaisesRegex(validator.ValidationError, "excluded test route"):
            validator.validate_output(self.site)
        (self.site / relative).unlink()
        (self.site / relative).parent.rmdir()
        self.write("guide/index.html", '<html><a href="../inline-code-spacing-test/">Test</a></html>')
        with self.assertRaisesRegex(validator.ValidationError, "excluded test route"):
            validator.validate_output(self.site)

    def test_symlinks_are_rejected_including_dangling_links(self):
        for target in (self.site / "index.html", self.site / "missing", self.site / "guide"):
            with self.subTest(target=target):
                link = self.site / "linked"
                link.symlink_to(target)
                with self.assertRaisesRegex(validator.ValidationError, "symlink"):
                    validator.validate_output(self.site)
                link.unlink()
        link.symlink_to(self.site, target_is_directory=True)
        with self.assertRaisesRegex(validator.ValidationError, "output directory is a symlink"):
            validator.validate_output(link)
        link.unlink()

    def test_invalid_public_certificate_fails(self):
        self.write("service/root.pem", "not a certificate")
        with self.assertRaises(validator.ssl.SSLError):
            validator.validate_output(self.site)


if __name__ == "__main__":
    unittest.main()
