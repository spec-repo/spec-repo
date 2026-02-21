# {{PROJECT_NAME}} — Spec Repository Agent Instructions

This repository manages all specification documents for **{{PROJECT_NAME}}**.
The agent must always follow the rules below.

---

## Directory Structure

```
00-rfp/        Received RFP source files (PDF, MD)
references/    Authored spec documents (markdown, master copy)
templates/     Templates for generating new documents
scripts/       Version tagging and PDF export automation
snapshots/     Approved PDF snapshots for client delivery
```

---

## When an RFP or Reference Document is Received

When the user provides a PDF or markdown file, **proceed immediately in the following order** without waiting for further instructions.

1. **Copy the file to `00-rfp/`**
2. **Read and analyze the document**
   - **PDF reading rules (follow this order strictly):**
     1. If `00-rfp/<filename>.txt` already exists, Read() that file
     2. Otherwise, try Read(`00-rfp/<filename>.pdf`)
     3. If Read() fails or returns a "too large" error, **immediately, without asking the user**, run:
        ```bash
        ./scripts/extract-pdf.sh 00-rfp/<filename>.pdf
        ```
        Then Read() the generated `.txt` file
   - Identify all functional requirements
   - Identify non-functional requirements (performance, security, availability)
   - Mark unclear items as `[NEEDS CLARIFICATION: ...]`
3. **Create `references/requirements.md`**
   - If the file does not exist, copy `templates/requirements.md` to create it
   - Fill in the template with the analysis results
   - Reference the source section/page from the RFP for each requirement
4. **Ask the human to review**
   - Summarize what was written
   - Incorporate feedback and request review again if needed
5. **When the human approves**, run `./scripts/tag.sh review requirements`

---

## Writing Design Documents

Write design documents after `requirements.md` reaches `approved` status.

| Document | Template | Output |
|----------|----------|--------|
| Architecture | templates/architecture.md | references/architecture.md |
| DB Design | templates/db-design.md | references/db-design.md |
| API Spec | templates/api-spec.md | references/api-spec.md |
| Test Scenarios | templates/test-scenarios.md | references/test-scenarios.md |

Follow the same flow for each: **write → request review → approved → tag**.

---

## Document Version Management

```bash
./scripts/tag.sh review <document-name>    # Request review (before sending to client)
./scripts/tag.sh approved <document-name>  # Mark as client-approved
./scripts/tag.sh list                       # List all tags
```

PDF snapshots are generated automatically when running `tag.sh review` or `tag.sh approved`.
To regenerate manually:
```bash
./scripts/export-pdf.sh <document-name> [review|approved]
```

---

## Document Change Rules

- If code diverges from the spec, **update the document before the code**
- After modifying a document, always get human confirmation before tagging
- The markdown in `references/` is always the master. The PDFs in `snapshots/` are delivery copies only.

---

## Project Reference

→ See `PROJECT.md`
