#!/usr/bin/env python3
"""
Mermaid 코드 블록을 PNG 이미지로 변환하는 전처리 스크립트.

```mermaid ... ``` 블록을 찾아 mmdc(Mermaid CLI)로 PNG 변환 후
![diagram](path/to/img.png) 으로 교체한 임시 MD 파일 경로를 stdout에 출력한다.
Mermaid 블록이 없으면 원본 경로를 그대로 출력한다.

Usage:
    python3 preprocess-mermaid.py --input <md_file>
    python3 preprocess-mermaid.py --input <md_file> --theme neutral

사전 요건: Node.js (npx) — mmdc는 첫 실행 시 자동 설치됨.
"""

import re
import subprocess
import sys
import tempfile
from pathlib import Path


def run_mmdc(mmd_file, png_file, theme="default"):
    """mmdc로 .mmd → .png 변환. WSL/Linux sandbox 플래그 포함."""
    cmd = [
        "npx", "--yes", "@mermaid-js/mermaid-cli",
        "-i", str(mmd_file),
        "-o", str(png_file),
        "--theme", theme,
        "--puppeteerConfig", '{"args":["--no-sandbox","--disable-setuid-sandbox"]}',
    ]
    return subprocess.run(cmd, capture_output=True, text=True)


def preprocess(md_path, theme="default"):
    content = Path(md_path).read_text(encoding="utf-8")
    pattern = re.compile(r"```mermaid\n(.*?)\n```", re.DOTALL)

    blocks = list(pattern.finditer(content))
    if not blocks:
        print(md_path)
        return

    tmp_dir = Path(tempfile.mkdtemp(prefix="mermaid_"))
    counter = 0
    failed = 0

    def replace_block(match):
        nonlocal counter, failed
        counter += 1
        mmd_file = tmp_dir / f"diagram_{counter:03d}.mmd"
        png_file = tmp_dir / f"diagram_{counter:03d}.png"
        mmd_file.write_text(match.group(1), encoding="utf-8")

        result = run_mmdc(mmd_file, png_file, theme)
        if result.returncode == 0 and png_file.exists():
            return f"![diagram]({png_file})"
        else:
            failed += 1
            sys.stderr.write(
                f"⚠️  Mermaid 변환 실패 (블록 {counter}):\n"
                f"   {result.stderr.strip()}\n"
            )
            return match.group(0)  # 원본 코드블록 유지

    new_content = pattern.sub(replace_block, content)

    if failed == counter:
        # 전부 실패 → 원본 반환
        print(md_path)
        return

    tmp_md = tmp_dir / "processed.md"
    tmp_md.write_text(new_content, encoding="utf-8")
    print(str(tmp_md))


def main():
    args = sys.argv[1:]
    md_path = None
    theme = "default"

    i = 0
    while i < len(args):
        if args[i] == "--input" and i + 1 < len(args):
            md_path = args[i + 1]
            i += 2
        elif args[i] == "--theme" and i + 1 < len(args):
            theme = args[i + 1]
            i += 2
        else:
            i += 1

    if not md_path:
        print("사용법: python3 preprocess-mermaid.py --input <md_file>", file=sys.stderr)
        sys.exit(1)

    if not Path(md_path).exists():
        print(f"오류: 파일 없음: {md_path}", file=sys.stderr)
        sys.exit(1)

    preprocess(md_path, theme)


if __name__ == "__main__":
    main()
