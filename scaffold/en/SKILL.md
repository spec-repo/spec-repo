---
name: {{PROJECT_NAME}}-spec
description: >
  {{PROJECT_NAME}} project requirements and design documents.
  Reference when implementing features, designing APIs, DB schemas, or writing test scenarios.
  Use scripts/tag.sh to manage document versions.
allowed-tools: Read Bash
---

# {{PROJECT_NAME}} Project Spec

## Document Index

| Document | Path | Status |
|----------|------|--------|
| Requirements | references/requirements.md | - |
| Architecture | references/architecture.md | - |
| DB Design | references/db-design.md | - |
| API Spec | references/api-spec.md | - |
| Test Scenarios | references/test-scenarios.md | - |

## Agent Rules

- Before implementing any feature, read the relevant document in **references/**
- If implementation must diverge from the spec, update the document before the code
- When changing an API endpoint, update `references/api-spec.md`
- When changing DB schema, update `references/db-design.md`
- After updating a document, request human review, then run `scripts/tag.sh`

## Version Management

```bash
# Request review
./scripts/tag.sh review <document-name>
# e.g.: ./scripts/tag.sh review requirements

# Mark as approved
./scripts/tag.sh approved <document-name>
# e.g.: ./scripts/tag.sh approved requirements
```

## Project Reference

→ See PROJECT.md
