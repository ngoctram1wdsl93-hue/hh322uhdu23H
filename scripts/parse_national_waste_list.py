#!/usr/bin/env python3
"""
Парсер офіційного PDF «Національний перелік відходів» (Постанова КМУ № 1102 від 20.10.2023).

Зчитує PDF та формує JSON з повною ієрархією:
  - Глава (рівень 1):   "01"
  - Підгрупа (рівень 2): "01 01"
  - Код виду (рівень 3): "01 01 01" / "01 03 04*"

Кожен запис містить:
  {
    "code", "code_normalized", "name", "level",
    "hazardous", "absolute_hazardous", "mirror_hazardous",
    "parent_code", "chapter", "group"
  }
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber

PDF_PATH = Path("/app/data/national_waste_list.pdf")
JSON_OUT = Path("/app/data/national_waste_list.json")

# Рядок коду: 2, 4 або 6 цифр (через пробіли) + опційна '*'
CODE_RE = re.compile(r"^(\d{2}(?:\s\d{2}){0,2})(\*?)\s+(.+)$")

# Маркери шапки таблиці, які треба пропускати
HEADER_PATTERNS = [
    "Код Найменування",
    "ЗАТВЕРДЖЕНО",
    "постановою",
    "НАЦІОНАЛЬНИЙ ПЕРЕЛІК",
    "Найменування групи",
]


def is_header(line: str) -> bool:
    s = line.strip()
    if not s:
        return True
    if re.fullmatch(r"\d{1,3}", s):  # номер сторінки
        return True
    for p in HEADER_PATTERNS:
        if p in s:
            return True
    return False


def normalize(code: str) -> str:
    """'01 01 01' -> '010101' (без '*')."""
    return re.sub(r"\D", "", code)


def parse() -> list[dict]:
    rows: list[dict] = []
    current: dict | None = None

    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for raw in text.split("\n"):
                line = raw.rstrip()
                if is_header(line):
                    continue

                stripped = line.strip()
                m = CODE_RE.match(stripped)
                # Захист від хибних збігів — продовження попереднього найменування
                # (PDF переноси рядків можуть починатися з 2-цифрових послідовностей)
                if m:
                    nm = m.group(3).strip()
                    first_ch = nm[0] if nm else ""
                    # Якщо назва закоротка, починається з цифри/розділового знаку —
                    # це переніс рядка з попереднього коду, а не новий запис.
                    if (
                        len(nm) < 4
                        or first_ch in ",.;:)]-–—і"
                        or first_ch.isdigit()
                    ):
                        m = None
                if m:
                    # Зберегти попередній запис
                    if current:
                        current["name"] = re.sub(r"\s+", " ", current["name"]).strip()
                        rows.append(current)

                    code_digits, star, name = m.group(1), m.group(2), m.group(3)
                    code = code_digits + star
                    parts = code_digits.split()
                    level = len(parts)
                    chapter = parts[0]
                    group = " ".join(parts[:2]) if level >= 2 else None
                    parent: str | None = None
                    if level == 2:
                        parent = parts[0]
                    elif level == 3:
                        parent = " ".join(parts[:2])

                    current = {
                        "code": code,
                        "code_normalized": normalize(code_digits),
                        "name": name.strip(),
                        "level": level,
                        "hazardous": bool(star),
                        "absolute_hazardous": bool(star),
                        "mirror_hazardous": False,  # буде позначено після парсингу
                        "parent_code": parent,
                        "chapter": chapter,
                        "group": group,
                    }
                else:
                    # Продовження найменування з попереднього рядка
                    if current is not None and line.strip():
                        current["name"] += " " + line.strip()

        if current:
            current["name"] = re.sub(r"\s+", " ", current["name"]).strip()
            rows.append(current)

    # Позначити mirror codes:
    # У підгрупі є пара: NN NN NN* (небезпечний) та NN NN NN+1 (текст «інші, ніж …»)
    by_group: dict[str, list[dict]] = {}
    for r in rows:
        if r["level"] == 3 and r.get("group"):
            by_group.setdefault(r["group"], []).append(r)

    for grp_codes in by_group.values():
        for r in grp_codes:
            nm_lower = r["name"].lower()
            if not r["hazardous"] and ("інші, ніж" in nm_lower or "інший, ніж" in nm_lower):
                r["mirror_hazardous"] = True

    return rows


def main():
    if not PDF_PATH.exists():
        print(f"PDF not found: {PDF_PATH}", file=sys.stderr)
        sys.exit(1)

    rows = parse()
    JSON_OUT.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Стат
    n_chap = sum(1 for r in rows if r["level"] == 1)
    n_grp = sum(1 for r in rows if r["level"] == 2)
    n_code = sum(1 for r in rows if r["level"] == 3)
    n_haz = sum(1 for r in rows if r.get("absolute_hazardous"))
    print(f"Total: {len(rows)}  chapters={n_chap}  groups={n_grp}  codes={n_code}  hazardous={n_haz}")
    print(f"Saved -> {JSON_OUT}")


if __name__ == "__main__":
    main()
