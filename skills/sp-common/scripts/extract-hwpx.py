#!/usr/bin/env python3
"""
아래아 한글(.hwp/.hwpx) 파일을 마크다운으로 변환하는 스크립트.

pyhwp2md 라이브러리를 사용한다.

Usage:
    python3 extract-hwpx.py <hwpx-file> [output.md]

    출력 경로 생략 시 stdout으로 출력.

사전 요건:
    pip install pyhwp2md
    (또는) uv run --with pyhwp2md python3 extract-hwpx.py ...

제한 사항:
    - 이미지는 추출되지 않습니다 (텍스트만 변환)
    - 수식, 특수 개체는 무시됩니다
"""

import sys
from pathlib import Path


def extract_with_pyhwp2md(hwpx_path: str) -> str:
    """pyhwp2md CLI를 subprocess로 호출해 MD 내용을 반환."""
    import subprocess
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            ["pyhwp2md", hwpx_path, "-o", tmp_path],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or "pyhwp2md 실행 실패")
        return Path(tmp_path).read_text(encoding="utf-8")
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def main():
    args = sys.argv[1:]
    if not args:
        print("사용법: python3 extract-hwpx.py <hwpx-file> [output.md]", file=sys.stderr)
        sys.exit(1)

    hwpx_path = args[0]
    output_path = args[1] if len(args) > 1 else None

    if not Path(hwpx_path).exists():
        print(f"오류: 파일 없음: {hwpx_path}", file=sys.stderr)
        sys.exit(1)

    ext = Path(hwpx_path).suffix.lower()
    if ext not in (".hwp", ".hwpx"):
        print(f"⚠️  경고: 지원 확장자는 .hwp, .hwpx입니다. (입력: {ext})", file=sys.stderr)

    try:
        md_content = extract_with_pyhwp2md(hwpx_path)
    except FileNotFoundError:
        print(
            "오류: pyhwp2md가 설치되어 있지 않습니다.\n"
            "설치: pip install pyhwp2md\n"
            "      (또는) uv run --with pyhwp2md python3 extract-hwpx.py ...",
            file=sys.stderr,
        )
        sys.exit(1)
    except RuntimeError as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)

    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        Path(output_path).write_text(md_content, encoding="utf-8")
        print(f"✅ 저장됨: {output_path}", file=sys.stderr)
        print(f"⚠️  이미지는 포함되지 않습니다.", file=sys.stderr)
    else:
        print(md_content)


if __name__ == "__main__":
    main()
