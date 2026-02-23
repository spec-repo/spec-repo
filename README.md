**English** | [한국어](README.ko.md)

---

# spec-repo

A CLI tool to manage SI project spec documents **together with AI agents**.

From the moment you receive an RFP through requirements analysis, design documents, and client delivery — spec-repo sets up a structure where agents can read and write spec documents on their own.

---

## Installation

```bash
npm install -g spec-repo
```

---

## Quick Start

```bash
# 1. Create a new project
spec-repo create my-project
cd my-project

# 2. Fill in PROJECT.md with your tech stack and conventions

# 3. Receive an RFP
spec-repo intake ./rfp.pdf

# 4. Paste the printed instructions into Claude Code or another agent
#    → Agent writes references/requirements.md automatically

# 5. Tag a version after review
./scripts/tag.sh review requirements    # Request review + generate PDF
./scripts/tag.sh approved requirements  # Client approved + generate PDF
```

---

## Why spec-repo?

AI agents work best when the file structure and rules are clear. But when every SI project organizes documents differently, you end up re-explaining the layout to your agent every time.

spec-repo standardizes:

- **Where things live** — fixed-purpose directories: `references/`, `templates/`, `snapshots/`
- **How the agent should behave** — rules embedded in `AGENTS.md` and `SKILL.md`
- **How document versions are tracked** — `tag.sh` creates review/approved Git tags and PDF snapshots

---

## Generated Project Structure

```
my-project/
├── SKILL.md        Agent skill entry point
├── AGENTS.md       Agent behavior rules
├── CLAUDE.md       Claude-specific rules
├── PROJECT.md      Tech stack, conventions, integrations
│
├── 00-rfp/         Received RFP originals
├── references/     Requirements, DB design, API spec, etc. (master)
├── templates/      Draft templates for each document
├── snapshots/      Approved PDF snapshots for client delivery
└── scripts/
    ├── tag.sh          Version tagging + PDF generation
    ├── export-pdf.sh   Markdown → PDF manual export
    └── extract-pdf.sh  PDF → TXT text extraction
```

---

## Command Reference

### `spec-repo create [project-name]`

Creates a new spec-repo project.

```bash
spec-repo create my-project            # Create in a new directory
spec-repo create .                     # Create in the current directory
spec-repo create my-project --lang ko  # Use Korean scaffold
spec-repo create my-project --no-git   # Skip git init
```

| Option | Description |
|--------|-------------|
| `--lang ko\|en` | Language. Auto-detected from system locale if omitted |
| `--no-git` | Skip git initialization |

### `spec-repo intake <file>`

Registers an RFP or reference document and prints agent analysis instructions.

```bash
spec-repo intake ./rfp.pdf
spec-repo intake ./security-requirements.md --type supplement
spec-repo intake ./rfp.pdf --dest 01-addendum
```

| Option | Description |
|--------|-------------|
| `--type rfp\|supplement` | Document type (default: `rfp`) |
| `--dest <dir>` | Destination directory (default: `00-rfp`) |

Supported formats: `.md`, `.pdf` (PDF text is extracted automatically)

---

## Document Version Management

```bash
# Request review before sending to client
./scripts/tag.sh review requirements

# Mark as client-approved
./scripts/tag.sh approved requirements

# List all tags
./scripts/tag.sh list
```

Running `review` or `approved` automatically generates a PDF in `snapshots/`.
To regenerate manually:

```bash
./scripts/export-pdf.sh requirements approved
./scripts/export-pdf.sh --all   # All files in references/
```

> **Prerequisite:** Node.js (npx). Chromium is downloaded automatically on first run (~100 MB, once only).

---

## Requirements

- Node.js 18+
- Git (for version tagging)
- npx (for PDF export)

---

## License

ISC
