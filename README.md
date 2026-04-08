# GeoClaw Workflows

Private repository for organizing Claude Code research assistant conversations, analysis outputs, and reusable scripts across GeoClaw client projects.

## Why This Repo Exists

| Benefit | Description |
|---------|-------------|
| **Conversation History** | Every Claude session is saved as structured outputs (MD, PDF, DOCX, CSV, JSON) — searchable and version-controlled |
| **Continuity** | Pick up any project exactly where you left off — new Claude sessions can read past outputs for context |
| **Knowledge Base** | Builds over time into a reusable library of geotechnical analysis, InSAR workflows, GEE scripts, and report templates |
| **Reproducibility** | Scripts and data processing steps are tracked with git, so results can be regenerated |
| **Collaboration** | Share specific sessions/outputs with team members via branches or direct links |
| **Audit Trail** | Git history shows what was analyzed, when, and what conclusions were drawn |

## Repository Structure

```
geoclaw-workflows/
├── README.md                          # This file
├── clients/                           # Per-client project work
│   └── terreatek/                     # Terreatek/Engesis project
│       ├── PROJECT.md                 # Project overview & status tracker
│       ├── sessions/                  # Claude conversation outputs (by date)
│       │   └── 2026-04-08_session01/  # First session outputs
│       ├── data-inventory/            # What data we have/need
│       └── scripts/                   # Reusable processing scripts
├── templates/                         # Report templates, common structures
└── .claude/                           # Claude Code context files
    └── CLAUDE.md                      # Instructions for future Claude sessions
```

## How to Use

### Continuing a Previous Session
When starting a new Claude Code session, point it to the relevant session folder:
```
"Read the files in clients/terreatek/sessions/2026-04-08_session01/ to understand
where we left off on the Terreatek landslide project"
```

### Adding a New Session
Each Claude conversation creates a new dated folder:
```
clients/<client>/sessions/YYYY-MM-DD_sessionNN/
```
Outputs are saved in multiple formats (MD, CSV, JSON, HTML, PDF, DOCX) for maximum flexibility.

### Finding Past Work
- Browse `clients/<client>/PROJECT.md` for project status
- Search markdown files with `git grep "keyword"`
- Check `sessions/` folders chronologically

## Current Projects

| Client | Project | Status | Latest Session |
|--------|---------|--------|----------------|
| Terreatek | Landslide Assessment - Juiz de Fora, MG, Brazil | In Progress | 2026-04-08 |
