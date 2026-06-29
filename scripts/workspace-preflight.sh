#!/usr/bin/env bash
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESIGN_SYSTEM_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_DIR="${MBS_WORKSPACE_DIR:-$(cd "$DESIGN_SYSTEM_DIR/.." && pwd)}"

FETCH=1
if [ "${1:-}" = "--no-fetch" ]; then
  FETCH=0
fi

RED="$(printf '\033[31m')"
GREEN="$(printf '\033[32m')"
YELLOW="$(printf '\033[33m')"
BLUE="$(printf '\033[34m')"
BOLD="$(printf '\033[1m')"
RESET="$(printf '\033[0m')"

fail_count=0
warn_count=0
ok_count=0

print_header() {
  printf '%s\n' ""
  printf '%s%s%s\n' "$BOLD" "$1" "$RESET"
}

rel_path() {
  local path="$1"
  case "$path" in
    "$WORKSPACE_DIR") printf '.' ;;
    "$WORKSPACE_DIR"/*) printf '%s' "${path#"$WORKSPACE_DIR"/}" ;;
    *) printf '%s' "$path" ;;
  esac
}

mark_fail() {
  fail_count=$((fail_count + 1))
}

mark_warn() {
  warn_count=$((warn_count + 1))
}

mark_ok() {
  ok_count=$((ok_count + 1))
}

git_count_commits() {
  local repo="$1"
  local range="$2"
  git -C "$repo" rev-list --count "$range" 2>/dev/null || printf '0'
}

repo_status() {
  local repo="$1"
  local rel
  rel="$(rel_path "$repo")"

  local branch upstream status_line dirty_count staged_risky local_env local_vercel local_ds
  branch="$(git -C "$repo" symbolic-ref --short HEAD 2>/dev/null || printf 'DETACHED')"
  upstream="$(git -C "$repo" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"

  if [ "$FETCH" -eq 1 ] && git -C "$repo" remote get-url origin >/dev/null 2>&1; then
    if ! git -C "$repo" fetch --quiet origin 2>/dev/null; then
      printf '  %s!%s origin fetch failed: %s\n' "$YELLOW" "$RESET" "$rel"
      mark_warn
    fi
  fi

  status_line="$(git -C "$repo" status --short --branch 2>/dev/null | head -n 1)"
  dirty_count="$(git -C "$repo" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

  printf '%s\n' "----------------------------------------"
  printf '%s%s%s  %s\n' "$BOLD" "$rel" "$RESET" "$status_line"

  if [ "$branch" = "DETACHED" ]; then
    printf '  %sBLOCK%s detached HEAD\n' "$RED" "$RESET"
    mark_fail
  fi

  if [ -z "$upstream" ]; then
    printf '  %sWARN%s upstream is not configured\n' "$YELLOW" "$RESET"
    mark_warn
  else
    local ahead behind
    ahead="$(git_count_commits "$repo" "$upstream..HEAD")"
    behind="$(git_count_commits "$repo" "HEAD..$upstream")"

    if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
      printf '  %sBLOCK%s branch diverged: ahead %s, behind %s\n' "$RED" "$RESET" "$ahead" "$behind"
      mark_fail
    elif [ "$behind" -gt 0 ]; then
      printf '  %sBLOCK%s branch is behind %s by %s commit(s)\n' "$RED" "$RESET" "$upstream" "$behind"
      mark_fail
    elif [ "$ahead" -gt 0 ]; then
      printf '  %sWARN%s branch is ahead of %s by %s commit(s)\n' "$YELLOW" "$RESET" "$upstream" "$ahead"
      mark_warn
    else
      printf '  %sOK%s branch is synced with %s\n' "$GREEN" "$RESET" "$upstream"
      mark_ok
    fi
  fi

  if [ "$dirty_count" -gt 0 ]; then
    printf '  %sWARN%s working tree has %s local change(s)\n' "$YELLOW" "$RESET" "$dirty_count"
    git -C "$repo" status --porcelain 2>/dev/null | sed 's/^/    /' | head -n 12
    mark_warn
  else
    printf '  %sOK%s working tree clean\n' "$GREEN" "$RESET"
    mark_ok
  fi

  staged_risky="$(git -C "$repo" diff --cached --name-only 2>/dev/null | grep -E '(^|/)(\.env|\.vercel|\.DS_Store|logs?|output)(/|$)|\.log$' || true)"
  if [ -n "$staged_risky" ]; then
    printf '  %sBLOCK%s risky staged file(s):\n' "$RED" "$RESET"
    printf '%s\n' "$staged_risky" | sed 's/^/    /'
    mark_fail
  fi

  local_env="$(find "$repo" -maxdepth 3 -name .env -type f -not -path '*/.git/*' -print 2>/dev/null | sed "s|^$repo/||" | head -n 8)"
  if [ -n "$local_env" ]; then
    printf '  %sINFO%s local .env exists, do not commit it\n' "$BLUE" "$RESET"
    printf '%s\n' "$local_env" | sed 's/^/    /'
  fi

  local_vercel="$(find "$repo" -maxdepth 4 -name .vercel -type d -not -path '*/.git/*' -print 2>/dev/null | sed "s|^$repo/||" | head -n 8)"
  if [ -n "$local_vercel" ]; then
    printf '  %sINFO%s local .vercel exists, keep it out of Git\n' "$BLUE" "$RESET"
    printf '%s\n' "$local_vercel" | sed 's/^/    /'
  fi

  local_ds="$(find "$repo" -maxdepth 3 -name .DS_Store -type f -not -path '*/.git/*' -print 2>/dev/null | sed "s|^$repo/||" | head -n 5)"
  if [ -n "$local_ds" ]; then
    printf '  %sINFO%s local .DS_Store exists, keep it ignored\n' "$BLUE" "$RESET"
  fi

  case "$rel" in
    barista-course)
      if [ "$branch" != "work/excu-local-page" ]; then
        printf '  %sINFO%s expected recent working branch was work/excu-local-page; current: %s\n' "$BLUE" "$RESET" "$branch"
      else
        printf '  %sINFO%s barista-course is on the known working branch\n' "$BLUE" "$RESET"
      fi
      ;;
    Calculator)
      printf '  %sINFO%s Calculator is a local archive; active copy is mbs-mixology-cup/legacy/participants-widget.html\n' "$BLUE" "$RESET"
      ;;
  esac
}

print_header "MBS workspace preflight"
printf 'Workspace: %s\n' "$WORKSPACE_DIR"
if [ "$FETCH" -eq 1 ]; then
  printf 'Network step: git fetch origin enabled. Use --no-fetch for offline mode.\n'
else
  printf 'Network step: disabled.\n'
fi

if [ ! -d "$WORKSPACE_DIR" ]; then
  printf '%sERROR%s workspace directory not found: %s\n' "$RED" "$RESET" "$WORKSPACE_DIR"
  exit 2
fi

repos_file="$(mktemp "${TMPDIR:-/tmp}/mbs-preflight-repos.XXXXXX")"
find "$WORKSPACE_DIR" \
  -path '*/.git' -type d -prune -print 2>/dev/null \
  | sed 's|/.git$||' \
  | sort > "$repos_file"

repo_total="$(wc -l < "$repos_file" | tr -d ' ')"
if [ "$repo_total" -eq 0 ]; then
  printf '%sERROR%s no Git repositories found\n' "$RED" "$RESET"
  rm -f "$repos_file"
  exit 2
fi

print_header "Git repositories"
while IFS= read -r repo; do
  repo_status "$repo"
done < "$repos_file"
rm -f "$repos_file"

print_header "Local non-Git notes"
if [ -d "$WORKSPACE_DIR/Calculator" ]; then
  printf '  %sINFO%s Calculator remains local archive by decision.\n' "$BLUE" "$RESET"
fi
if [ ! -d "$WORKSPACE_DIR/MBSProjectMap" ]; then
  printf '  %sINFO%s MBSProjectMap folder not found; current map is mbs-design-system/WORKSPACE_GIT_STATUS.md.\n' "$BLUE" "$RESET"
fi

print_header "Summary"
printf 'Repositories checked: %s\n' "$repo_total"
printf 'OK checks: %s\n' "$ok_count"
printf 'Warnings: %s\n' "$warn_count"
printf 'Blocks: %s\n' "$fail_count"

if [ "$fail_count" -gt 0 ]; then
  printf '%sResult: stop before coding. Fix blocked repositories first.%s\n' "$RED" "$RESET"
  exit 1
fi

if [ "$warn_count" -gt 0 ]; then
  printf '%sResult: can work only after reviewing warnings.%s\n' "$YELLOW" "$RESET"
  exit 0
fi

printf '%sResult: workspace looks ready.%s\n' "$GREEN" "$RESET"
