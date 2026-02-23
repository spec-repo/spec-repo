#!/usr/bin/env python3
"""
requirements.json → references/requirements.md 생성 스크립트.
import/draft 명령 후 자동으로 호출된다.

Usage:
    python3 json-to-md.py
    python3 json-to-md.py --input references/requirements.json
    python3 json-to-md.py --out references/requirements.md
"""

import sys
import json
from pathlib import Path


def find_json_path(start_dir):
    """references/requirements.json 탐색."""
    current = Path(start_dir).resolve()
    for _ in range(10):
        candidate = current / "references" / "requirements.json"
        if candidate.exists():
            return candidate
        if (current / "AGENTS.md").exists() or (current / ".git").is_dir():
            return current / "references" / "requirements.json"
        parent = current.parent
        if parent == current:
            break
        current = parent
    return Path(start_dir).resolve() / "references" / "requirements.json"


def _trunc(text, n=50):
    """셀 내용 줄바꿈 처리 및 길이 제한."""
    if not text:
        return ""
    return str(text).replace("\n", " ").strip()[:n]


def render_functional(items):
    lines = []
    for item in items:
        pid  = item.get("id", "")
        name = item.get("rfp_name", "")
        desc = item.get("rfp_desc", "")
        subs = item.get("sub_requirements", [])

        lines.append(f"### {pid} — {name}")
        lines.append("")

        if desc:
            lines.append(f"> {desc}")
            lines.append("")

        # 공통 메타 (첫 번째 세부항목 기준)
        if subs:
            first = subs[0]
            meta = []
            if first.get("priority"):  meta.append(f"**우선순위**: {first['priority']}")
            if first.get("status"):    meta.append(f"**상태**: {first['status']}")
            if first.get("source"):    meta.append(f"**출처**: {first['source']}")
            if meta:
                lines.append(" | ".join(meta))
                lines.append("")

            lines.append("| 세부ID | 대분류 | 중분류 | 고객요구사항 | 상세요구사항 | 구현방안 | 담당자 | 상태 |")
            lines.append("|--------|--------|--------|------------|------------|---------|--------|------|")
            for sub in subs:
                row = [
                    sub.get("sub_id", ""),
                    sub.get("category_major", ""),
                    sub.get("category_minor", ""),
                    _trunc(sub.get("customer_requirement", "")),
                    _trunc(sub.get("detail_requirement", "")),
                    _trunc(sub.get("implementation", "")),
                    sub.get("owner", ""),
                    sub.get("status", ""),
                ]
                lines.append("| " + " | ".join(row) + " |")
            lines.append("")

        lines.append("---")
        lines.append("")
    return lines


def render_nonfunctional(items):
    lines = []
    for item in items:
        pid  = item.get("id", "")
        name = item.get("rfp_name", "")
        desc = item.get("rfp_desc", "")
        subs = item.get("sub_requirements", [])

        lines.append(f"### {pid} — {name}")
        lines.append("")

        if desc:
            lines.append(f"> {desc}")
            lines.append("")

        if subs:
            first = subs[0]
            meta = []
            if first.get("priority"):  meta.append(f"**우선순위**: {first['priority']}")
            if first.get("status"):    meta.append(f"**상태**: {first['status']}")
            if first.get("func_type"): meta.append(f"**구분**: {first['func_type']}")
            if meta:
                lines.append(" | ".join(meta))
                lines.append("")

            lines.append("| 세부ID | 대분류 | 중분류 | 고객요구사항 | 상세요구사항 | 담당자 |")
            lines.append("|--------|--------|--------|------------|------------|--------|")
            for sub in subs:
                row = [
                    sub.get("sub_id", ""),
                    sub.get("category_major", ""),
                    sub.get("category_minor", ""),
                    _trunc(sub.get("customer_requirement", "")),
                    _trunc(sub.get("detail_requirement", "")),
                    sub.get("owner", ""),
                ]
                lines.append("| " + " | ".join(row) + " |")
            lines.append("")

        lines.append("---")
        lines.append("")
    return lines


def main():
    args = sys.argv[1:]

    if "-h" in args or "--help" in args:
        print(__doc__)
        sys.exit(0)

    in_path  = None
    out_path = None

    i = 0
    while i < len(args):
        if args[i] == "--input" and i + 1 < len(args):
            in_path = Path(args[i + 1])
            i += 2
        elif args[i] == "--out" and i + 1 < len(args):
            out_path = Path(args[i + 1])
            i += 2
        else:
            i += 1

    if in_path is None:
        in_path = find_json_path(Path.cwd())

    if not in_path.exists():
        print(f"ERROR: JSON 파일 없음: {in_path}", file=sys.stderr)
        sys.exit(1)

    if out_path is None:
        out_path = in_path.parent / "requirements.md"

    with open(in_path, encoding="utf-8") as f:
        data = json.load(f)

    meta     = data.get("_meta", {})
    version  = meta.get("version") or "미설정"
    history  = meta.get("history", [])
    last_upd = history[-1]["imported_at"][:10] if history else "미설정"

    functional    = data.get("functional", [])
    nonfunctional = data.get("nonfunctional", [])

    lines = []
    lines.append("# 요구사항정의서")
    lines.append("")
    lines.append(
        f"> **버전**: {version}"
        f" | **기능 요구사항**: {len(functional)}개"
        f" | **비기능 요구사항**: {len(nonfunctional)}개"
        f" | **마지막 갱신**: {last_upd}"
    )
    lines.append("")
    lines.append("> ⚠️ 이 파일은 `references/requirements.json`에서 자동 생성됩니다. 직접 편집하지 마세요.")
    lines.append("")
    lines.append("---")
    lines.append("")

    if functional:
        lines.append("## 기능 요구사항")
        lines.append("")
        lines.extend(render_functional(functional))

    if nonfunctional:
        lines.append("## 비기능 요구사항")
        lines.append("")
        lines.extend(render_nonfunctional(nonfunctional))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"✅ MD 생성 완료: {out_path}")
    print(f"   기능 요구사항:   {len(functional)}개")
    print(f"   비기능 요구사항: {len(nonfunctional)}개")


if __name__ == "__main__":
    main()
