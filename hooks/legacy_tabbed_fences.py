"""Small compatibility and output tweaks for the Safespring docs build."""

from __future__ import annotations

from dataclasses import dataclass
import re


FENCE_OPEN_RE = re.compile(r"^(?P<indent>[ \t]*)(?P<fence>`{3,}|~{3,})(?P<attrs>.*)$")
TAB_ATTR_RE = re.compile(r"(?:^|\s)tab=")
IMG_TAG_RE = re.compile(r"<img\b(?P<attrs>[^>]*)>", re.IGNORECASE)


@dataclass
class LegacyTabbedFence:
    indent: str
    fence: str
    language: str
    label: str


def parse_opening_line(line: str) -> LegacyTabbedFence | None:
    match = FENCE_OPEN_RE.match(line)
    if not match:
        return None

    attrs = match.group("attrs").strip()
    tab_match = TAB_ATTR_RE.search(attrs)
    if not tab_match:
        return None

    language = attrs[: tab_match.start()].strip()
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
            converted.append(lines[index])
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


def on_page_content(html: str, **kwargs) -> str:
    return add_image_loading_attributes(html)
