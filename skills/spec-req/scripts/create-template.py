#!/usr/bin/env python3
"""
요구사항정의서 Excel 템플릿 생성 스크립트.
../data/requirements-template.xlsx 를 생성한다.

Usage:
    uv run python3 create-template.py
    python3 create-template.py
"""

import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl not installed. Run: pip install openpyxl", file=sys.stderr)
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).parent))
from sheet_styles import build_sheet


# ── 기능 요구사항 시트 ────────────────────────────────────────
FUNC_COLS = [
    # (col, row1_label,            row2_label,                     width)
    ( 1, "요구사항 ID",            None,                            10),
    ( 2, "제안요청서",              "요구사항 명",                    16),
    ( 3, "제안요청서",              "요구사항 설명",                  20),
    ( 4, "세부요구사항ID",          None,                            12),
    ( 5, "업무기능",               "대분류",                         10),
    ( 6, "업무기능",               "중분류",                         10),
    ( 7, "고객요구사항",            None,                            20),
    ( 8, "상세요구사항",            None,                            28),
    ( 9, "설계 및 구현방안",        "전제조건 및 구현방안",            22),
    (10, "설계 및 구현방안",        "제약사항",                       16),
    (11, "산출물",                 None,                             8),
    (12, "기능구분",               None,                             8),
    (13, "우선순위",               None,                             8),
    (14, "출처",                   None,                            10),
    (15, "요구자",                 None,                            10),
    (16, "요청일",                 None,                            12),
    (17, "완료일",                 None,                            12),
    (18, "업무담당자",             None,                            10),
    (19, "동료검토",               None,                            10),
    (20, "담당자연락처",            None,                            14),
    (21, "적용구분",               None,                            10),
    (22, "요구관리상태",            None,                            12),
    (23, "변경근거",               None,                            14),
]

FUNC_MERGES_R1 = {
    "제안요청서":      (2, 3),
    "업무기능":        (5, 6),
    "설계 및 구현방안": (9, 10),
}

FUNC_SAMPLE = [
    "SFR-001", "[요구사항 명]", "[요구사항 설명]", "SFR-001-01",
    "[대분류]", "[중분류]", "[고객요구사항]", "[상세요구사항]",
    "[전제조건 및 구현방안]", "[제약사항]",
    "-", "기능", "상", "제안요청서",
    "[요구자]", "YYYY.MM.DD", "YYYY.MM.DD",
    "[업무담당자]", "[동료검토]", "[연락처]",
    "수용", "신규", "",
]


# ── 비기능 요구사항 시트 ──────────────────────────────────────
NONFUNC_COLS = [
    ( 1, "요구사항 ID",            None,                            10),
    ( 2, "제안요청서",              "요구사항 명",                    16),
    ( 3, "제안요청서",              "요구사항 설명",                  20),
    ( 4, "요구사항ID(세부)",        None,                            12),
    ( 5, "업무기능",               "대분류",                         10),
    ( 6, "업무기능",               "중분류",                         10),
    ( 7, "고객요구사항",            None,                            20),
    ( 8, "상세요구사항",            None,                            28),
    ( 9, "상세구현방안",            None,                            22),
    (10, "산출물명",               None,                             8),
    (11, "관련근거",               None,                            10),
    (12, "기능구분",               None,                             8),
    (13, "우선순위",               None,                             8),
    (14, "출처",                   None,                            10),
    (15, "요구자",                 None,                            10),
    (16, "요청일",                 None,                            12),
    (17, "완료일",                 None,                            12),
    (18, "업무담당자",             None,                            10),
    (19, "동료검토",               None,                            10),
    (20, "담당자연락처",            None,                            14),
    (21, "적용구분",               None,                            10),
    (22, "요구관리상태",            None,                            12),
    (23, "변경근거",               None,                            14),
    (24, "설계 및 구현 제약사항",   "전제조건",                       18),
    (25, "설계 및 구현 제약사항",   "제약사항",                       16),
]

NONFUNC_MERGES_R1 = {
    "제안요청서":           (2, 3),
    "업무기능":             (5, 6),
    "설계 및 구현 제약사항": (24, 25),
}

NONFUNC_SAMPLE = [
    "PER-001", "[성능 요구사항 명]", "[성능 요구사항 설명]", "PER-001-01",
    "", "", "[고객요구사항]", "[상세요구사항]", "[상세구현방안]",
    "", "",
    "성능", "상", "제안요청서",
    "[요구자]", "YYYY.MM.DD", "",
    "[업무담당자]", "[동료검토]", "[연락처]",
    "수용", "신규", "",
    "[전제조건]", "[제약사항]",
]


def main():
    out_dir = Path(__file__).parent.parent / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "requirements-template.xlsx"

    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    build_sheet(wb, "기능_요구사항",   FUNC_COLS,    FUNC_MERGES_R1,    FUNC_SAMPLE)
    build_sheet(wb, "비기능_요구사항", NONFUNC_COLS, NONFUNC_MERGES_R1, NONFUNC_SAMPLE)

    wb.save(out_path)
    print(f"✅ 생성 완료: {out_path}")
    print(f"   시트: 기능_요구사항, 비기능_요구사항")


if __name__ == "__main__":
    main()
