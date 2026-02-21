# API Specification

**Project**: [Project Name]
**Version**: 0.1
**Date**: [Date]
**Status**: Draft

---

## Common

- **Base URL**: `https://api.example.com/v1`
- **Authentication**: Bearer Token (Authorization header)
- **Response format**: JSON

### Common Response Structure

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| AUTH_001 | 401 | Missing auth token |
| AUTH_002 | 403 | Insufficient permissions |
| VAL_001 | 400 | Missing required parameter |

---

## Endpoints

### [Domain]

#### GET /[resource]

**Description**: [What this endpoint does]

**Query Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| | | | |

**Response Example**

```json
{
  "success": true,
  "data": []
}
```

---

#### POST /[resource]

**Description**:

**Request Body**

```json
{
}
```

**Response Example**

```json
{
  "success": true,
  "data": {}
}
```

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | [Date] | Initial draft | |
