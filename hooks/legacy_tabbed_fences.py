"""Small compatibility and output tweaks for the Safespring docs build."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
import hashlib
import gzip
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

from rcssmin import cssmin


FENCE_OPEN_RE = re.compile(r"^(?P<indent>[ \t]*)(?P<fence>`{3,}|~{3,})(?P<attrs>.*)$")
TAB_ATTR_RE = re.compile(r"(?:^|\s)tab=")
MASCOT_ATTR_RE = re.compile(r"(?<!\S)mascot=(?P<variant>yes|sit|sitting)(?!\S)")
MASCOT_FACE_ATTR_RE = re.compile(
    r"(?<!\S)(?:mascot-face|mascot-expression)=(?P<face>[A-Za-z0-9_-]+)(?!\S)"
)
FENCE_ATTR_LIST_RE = re.compile(r"\{(?P<attrs>[^}]*)\}")
IMG_TAG_RE = re.compile(r"<img\b(?P<attrs>[^>]*)>", re.IGNORECASE)
H1_RE = re.compile(r"(<h1\b[^>]*>.*?</h1>)", re.IGNORECASE | re.DOTALL)
MASCOT_CODE_CLASS = "safespring-code-with-mascot"
MASCOT_SITTING_CLASS = "safespring-code-mascot-sitting"
MASCOT_FACE_CLASS_PREFIX = "safespring-code-mascot-face-"
LEGACY_BACKUP_PREFIX = "backup/legacy-backup-service/"
LEGACY_BACKUP_WARNING = """
<div class="admonition warning safespring-legacy-warning" role="note" aria-label="Legacy Backup service notice">
  <p class="admonition-title">Legacy Backup service</p>
  <p>
    This documentation is for the legacy Backup service. For current Backup
    documentation, start with <a href="/backup/quickstart-guide/">Getting Started</a>.
  </p>
</div>
""".strip()


def on_config(config, **kwargs):
    docs_dir = Path(config["docs_dir"])
    if not docs_dir.is_absolute():
        config_file_path = Path(getattr(config, "config_file_path", "") or "mkdocs.yml")
        docs_dir = config_file_path.parent / docs_dir

    codeblocks_js = docs_dir / "safespring-codeblocks.js"
    try:
        codeblocks_js_version = hashlib.sha256(codeblocks_js.read_bytes()).hexdigest()[:16]
    except FileNotFoundError:
        codeblocks_js_version = "missing"

    extra_javascript = []
    for entry in config.get("extra_javascript", []):
        if isinstance(entry, str) and entry.split("?", 1)[0] == "safespring-codeblocks.js":
            extra_javascript.append(f"safespring-codeblocks.js?v={codeblocks_js_version}")
        else:
            extra_javascript.append(entry)

    config["extra_javascript"] = extra_javascript
    return config


def on_files(files, config, **kwargs):
    css = files.get_file_from_path("safespring.css")
    if css is None:
        raise FileNotFoundError("Required stylesheet safespring.css is missing")
    # Transform only the generated file; keep the editable source intact.
    css.content_string = cssmin(css.content_string, keep_bang_comments=True) + "\n"
    config["extra"]["safespring_css_version"] = hashlib.sha256(css.content_bytes).hexdigest()[:16]
    return files


@dataclass
class LegacyTabbedFence:
    indent: str
    fence: str
    language: str
    label: str


def normalize_mascot_face(face: str | None) -> str | None:
    if not face:
        return None

    face = face.strip().lower()
    if face.isdigit() and 1 <= int(face) <= 8:
        return face

    return None


def strip_mascot_attributes(attrs: str) -> tuple[str, str | None, str | None]:
    variant: str | None = None
    face: str | None = None

    def remember_variant(match: re.Match[str]) -> str:
        nonlocal variant
        variant = match.group("variant")
        return ""

    def remember_face(match: re.Match[str]) -> str:
        nonlocal face
        face = normalize_mascot_face(match.group("face"))
        return ""

    attrs_without_mascot, mascot_count = MASCOT_ATTR_RE.subn(remember_variant, attrs)
    attrs_without_mascot, face_count = MASCOT_FACE_ATTR_RE.subn(remember_face, attrs_without_mascot)
    attrs_without_mascot = re.sub(r"[ \t]{2,}", " ", attrs_without_mascot).strip()

    if face_count and not mascot_count:
        variant = "yes"

    return attrs_without_mascot, variant if mascot_count or face_count else None, face


def mascot_class_tokens(variant: str | None, face: str | None = None) -> list[str]:
    tokens = [f".{MASCOT_CODE_CLASS}"]
    if variant in {"sit", "sitting"}:
        tokens.append(f".{MASCOT_SITTING_CLASS}")
    if face:
        tokens.append(f".{MASCOT_FACE_CLASS_PREFIX}{face}")
    return tokens


def add_mascot_class(attrs: str, variant: str | None, face: str | None = None) -> str:
    class_tokens = mascot_class_tokens(variant, face)
    class_value = " ".join(class_tokens)
    attrs = attrs.strip()
    if not attrs:
        return f"{{{class_value}}}"

    match = FENCE_ATTR_LIST_RE.search(attrs)
    if not match:
        return f"{attrs} {{{class_value}}}"

    attr_list = match.group("attrs").strip()
    next_class_tokens = [token for token in class_tokens if token not in attr_list.split()]
    if not next_class_tokens:
        return attrs

    next_attr_list = f"{' '.join(next_class_tokens)} {attr_list}".strip()
    return f"{attrs[:match.start()]}{{{next_attr_list}}}{attrs[match.end():]}".strip()


def normalize_mascot_fence_opening(line: str) -> str:
    match = FENCE_OPEN_RE.match(line)
    if not match:
        return line

    attrs, mascot_variant, mascot_face = strip_mascot_attributes(match.group("attrs").strip())
    if not mascot_variant:
        return line

    return f"{match.group('indent')}{match.group('fence')}{add_mascot_class(attrs, mascot_variant, mascot_face)}"


def parse_opening_line(line: str) -> LegacyTabbedFence | None:
    match = FENCE_OPEN_RE.match(line)
    if not match:
        return None

    attrs, mascot_variant, mascot_face = strip_mascot_attributes(match.group("attrs").strip())
    tab_match = TAB_ATTR_RE.search(attrs)
    if not tab_match:
        return None

    language = attrs[: tab_match.start()].strip()
    if mascot_variant:
        language = add_mascot_class(language, mascot_variant, mascot_face)

    label = attrs[tab_match.end() :].strip()
    if len(label) >= 2 and label[0] in {"'", '"'} and label[-1] == label[0]:
        label = label[1:-1]

    return LegacyTabbedFence(
        indent=match.group("indent"),
        fence=match.group("fence"),
        language=language,
        label=label,
    )


def is_closing_fence(line: str, opening_fence: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False

    fence_char = opening_fence[0]
    if not stripped.startswith(fence_char * len(opening_fence)):
        return False

    return set(stripped) == {fence_char}


def rewrite_legacy_tabbed_fences(markdown: str) -> str:
    lines = markdown.splitlines()
    converted: list[str] = []
    index = 0

    while index < len(lines):
        parsed = parse_opening_line(lines[index])
        if parsed is None:
            converted.append(normalize_mascot_fence_opening(lines[index]))
            index += 1
            continue

        closing_index = index + 1
        while closing_index < len(lines):
            if is_closing_fence(lines[closing_index], parsed.fence):
                break
            closing_index += 1

        if closing_index >= len(lines):
            converted.append(lines[index])
            index += 1
            continue

        nested_indent = f"{parsed.indent}    "
        opening = (
            f"{nested_indent}{parsed.fence}{parsed.language}"
            if parsed.language
            else f"{nested_indent}{parsed.fence}"
        )

        converted.append(f'{parsed.indent}=== "{parsed.label}"')
        converted.append("")
        converted.append(opening)
        for content_line in lines[index + 1 : closing_index]:
            converted.append(f"{nested_indent}{content_line}")
        converted.append(f"{nested_indent}{parsed.fence}")

        index = closing_index + 1

    return "\n".join(converted)


def on_page_markdown(markdown: str, **kwargs) -> str:
    return rewrite_legacy_tabbed_fences(markdown)


def add_image_loading_attributes(html: str) -> str:
    image_index = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal image_index

        image_index += 1
        attrs = match.group("attrs").rstrip()
        if attrs.endswith("/"):
            attrs = attrs[:-1].rstrip()

        next_attrs = attrs

        if not re.search(r"\sdecoding=", attrs, re.IGNORECASE):
            next_attrs += ' decoding="async"'

        if image_index > 1 and not re.search(r"\sloading=", attrs, re.IGNORECASE):
            next_attrs += ' loading="lazy"'

        return f"<img{next_attrs}>"

    return IMG_TAG_RE.sub(replace, html)


def is_legacy_backup_page(page: object | None) -> bool:
    if page is None:
        return False

    page_url = getattr(page, "url", "") or ""
    if page_url.startswith(LEGACY_BACKUP_PREFIX):
        return True

    page_file = getattr(page, "file", None)
    for attribute in ("src_uri", "src_path"):
        path = getattr(page_file, attribute, "") or ""
        if path.startswith(LEGACY_BACKUP_PREFIX):
            return True

    return False


def add_legacy_backup_warning(html: str, page: object | None) -> str:
    if not is_legacy_backup_page(page):
        return html

    if "safespring-legacy-warning" in html:
        return html

    match = H1_RE.search(html)
    if match:
        return f"{html[:match.end()]}\n{LEGACY_BACKUP_WARNING}\n{html[match.end():]}"

    return f"{LEGACY_BACKUP_WARNING}\n{html}"


def on_page_content(html: str, page: object | None = None, **kwargs) -> str:
    html = add_image_loading_attributes(html)
    return add_legacy_backup_warning(html, page or kwargs.get("page"))


def on_post_page(output: str, page: object | None = None, **kwargs) -> str:
    return add_legacy_backup_warning(output, page or kwargs.get("page"))


def on_nav(nav, config, **kwargs):
    """Keep sitemap scope aligned with navigation without removing any pages."""
    config.extra["safespring_sitemap_urls"] = sorted(
        {urljoin(config.site_url, page.url) for page in nav.pages}
    )
    return nav


def on_post_build(config, **kwargs):
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    site = Path(config.site_dir)
    sitemap = site / "sitemap.xml"
    tree = ET.fromstring(sitemap.read_bytes())
    allowed = set(config.extra["safespring_sitemap_urls"])
    for node in list(tree):
        location = node.find(f"{{{namespace}}}loc")
        if location is None or location.text not in allowed:
            tree.remove(node)
    actual = {node.find(f"{{{namespace}}}loc").text for node in tree}
    if not allowed or actual != allowed:
        raise RuntimeError("Sitemap does not match navigation")
    ET.register_namespace("", namespace)
    data = ET.tostring(tree, encoding="utf-8", xml_declaration=True)
    sitemap.write_bytes(data)
    (site / "sitemap.xml.gz").write_bytes(gzip.compress(data, mtime=0))
