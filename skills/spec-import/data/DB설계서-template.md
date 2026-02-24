---
title: DB설계서
version: 0.1.0
status: draft
updated: {{DATE}}
code-relevant: true
based_on:
  requirements: ""
---

# DB 설계서

## 1. ERD

```mermaid
erDiagram
    USER {
        int id PK
        string email
        string name
        datetime created_at
    }

    ORDER {
        int id PK
        int user_id FK
        datetime ordered_at
    }

    USER ||--o{ ORDER : "places"
```

---

## 2. 테이블 정의

### users

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | INT | N | AUTO_INCREMENT | PK |
| email | VARCHAR(255) | N | | 이메일 |
| name | VARCHAR(100) | N | | 이름 |
| created_at | DATETIME | N | NOW() | 생성일 |

<!-- 테이블을 계속 추가하세요 -->

---

## 3. 인덱스 정의

| 테이블 | 인덱스명 | 컬럼 | 타입 | 목적 |
|--------|---------|------|------|------|
| | | | | |
