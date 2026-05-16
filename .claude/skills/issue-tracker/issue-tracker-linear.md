# Issue tracker: Linear

Issues and PRDs for this repo live as Linear issues. Use the `linear` CLI for all operations. All issues go in the **"HDR"** project.

## Prerequisites

The `linear` command must be on PATH and authenticated:
```bash
linear --version
linear auth whoami
```

## Conventions

- **Create an issue**: Use a temp file for the body to preserve markdown formatting, then pass `--project "HDR"`:
```bash
  cat > /tmp/issue-body.md <<'EOF'
  Your description here.
  EOF
  linear issue create --title "..." --description-file /tmp/issue-body.md --project "HDR"
  rm /tmp/issue-body.md
```
  For simple single-line descriptions, inline is acceptable:
```bash
  linear issue create --title "..." --description "Short description" --project "HDR"
```

- **Read an issue**: `linear issue view HDR-<number> --comments`

- **List issues**: `linear issue list --project "HDR" --json` to get structured output; pipe through `jq` for filtering:
```bash
  linear issue list --project "HDR" --json | jq '[.[] | {id, title, state, labels}]'
```

- **Comment on an issue**: Use a temp file for multi-line bodies:
```bash
  cat > /tmp/comment.md <<'EOF'
  Your comment here.
  EOF
  linear issue comment add HDR-<number> --body-file /tmp/comment.md
  rm /tmp/comment.md
```
  For single-line comments: `linear issue comment add HDR-<number> --body "..."`

- **Apply labels**: `linear issue update HDR-<number> --label "..."`

- **Close**: `linear issue update HDR-<number> --status "Done"` (or the appropriate completed state name for your team)

## When a skill says "publish to the issue tracker"

Create a Linear issue using `linear issue create` with `--project "HDR"`.

## When a skill says "fetch the relevant ticket"

Run `linear issue view HDR-<number> --comments`.