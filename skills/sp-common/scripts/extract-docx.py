#!/usr/bin/env python3
"""
Word(.docx) 파일을 마크다운으로 변환하는 스크립트.

python-docx로 단락/표/제목 구조를 보존해 변환한다.
python-docx가 없거나 실패하면 mammoth(HTML 경유)로 fallback.

Usage:
    python3 extract-docx.py <docx-file> [output.md]

    출력 경로 생략 시 stdout으로 출력.

사전 요건:
    uv run --with python-docx python3 extract-docx.py ...
    uv run --with mammoth python3 extract-docx.py ...   (fallback)
"""

import re
import sys
from pathlib import Path


def heading_level(style_name: str) -> int:
    """Heading 1 → 1, Heading 2 → 2, ... 매핑. 0이면 일반 단락."""
    m = re.match(r"[Hh]eading\s*(\d)", style_name or "")
    return int(m.group(1)) if m else 0


def table_to_md(table) -> str:
    """python-docx Table 객체 → Markdown 표."""
    rows = []
    for i, row in enumerate(table.rows):
        cells = [cell.text.replace("\n", " ").strip() for cell in row.cells]
        rows.append("| " + " | ".join(cells) + " |")
        if i == 0:
            rows.append("| " + " | ".join(["---"] * len(cells)) + " |")
    return "\n".join(rows)


def extract_with_python_docx(docx_path: str) -> str:
    import docx  # type: ignore

    doc = docx.Document(docx_path)
    lines = []

    for block in doc.element.body:
        tag = block.tag.split("}")[-1] if "}" in block.tag else block.tag

        if tag == "p":
            # 단락
            para = docx.text.paragraph.Paragraph(block, doc)
            text = para.text.strip()
            if not text:
                lines.append("")
                continue
            level = heading_level(para.style.name if para.style else "")
            if level:
                lines.append(f"{'#' * level} {text}")
            else:
                lines.append(text)

        elif tag == "tbl":
            # 표
            from docx.table import Table  # type: ignore
            tbl = Table(block, doc)
            lines.append("")
            lines.append(table_to_md(tbl))
            lines.append("")

    return "\n".join(lines)


def extract_with_mammoth(docx_path: str) -> str:
    import mammoth  # type: ignore
    import html

    with open(docx_path, "rb") as f:
        result = mammoth.convert_to_markdown(f)
    return result.value


def main():
    args = sys.argv[1:]
    if not args:
        print("사용법: python3 extract-docx.py <docx-file> [output.md]", file=sys.stderr)
        sys.exit(1)

    docx_path = args[0]
    output_path = args[1] if len(args) > 1 else None

    if not Path(docx_path).exists():
        print(f"오류: 파일 없음: {docx_path}", file=sys.stderr)
        sys.exit(1)

    md_content = None

    # 1차 시도: python-docx
    try:
        md_content = extract_with_python_docx(docx_path)
    except ImportError:
        pass
    except Exception as e:
        sys.stderr.write(f"⚠️  python-docx 변환 실패: {e}\n")

    # fallback: mammoth
    if not md_content:
        try:
            md_content = extract_with_mammoth(docx_path)
        except ImportError:
            print(
                "오류: python-docx 또는 mammoth가 필요합니다.\n"
                "설치: uv run --with python-docx python3 extract-docx.py ...\n"
                "      uv run --with mammoth python3 extract-docx.py ...",
                file=sys.stderr,
            )
            sys.exit(1)
        except Exception as e:
            print(f"오류: 변환 실패: {e}", file=sys.stderr)
            sys.exit(1)

    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        Path(output_path).write_text(md_content, encoding="utf-8")
        print(f"✅ 저장됨: {output_path}", file=sys.stderr)
    else:
        print(md_content)


if __name__ == "__main__":
    main()
