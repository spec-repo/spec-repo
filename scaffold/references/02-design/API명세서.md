---
title: API명세서
version: 0.1.0
status: draft
updated: {{DATE}}
based_on:
  requirements: ""
---

# API 명세서

## 공통 사항

- **Base URL**: `https://api.example.com/v1`
- **인증**: Bearer Token (Authorization 헤더)
- **응답 형식**: JSON

### 공통 응답 구조

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### 공통 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| AUTH_001 | 401 | 인증 토큰 없음 |
| AUTH_002 | 403 | 권한 없음 |
| VAL_001 | 400 | 필수 파라미터 누락 |

---

## 엔드포인트

### [도메인명]

#### GET /[resource]

**설명**: [기능 설명]

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| | query | | | |

**응답 예시**

```json
{
  "success": true,
  "data": []
}
```

---

#### POST /[resource]

**설명**:

**요청 Body**

```json
{
}
```

**응답 예시**

```json
{
  "success": true,
  "data": {}
}
```
