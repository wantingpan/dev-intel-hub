#!/usr/bin/env bash
# 把指定檔案的變動提交到 data 分支並推上去。用法：push-data.sh "提交訊息" 檔案...
# 提交訊息會加上 [skip ci]，讓 GitHub Actions 的 CI 與 Cloudflare Pages 都不要為了這次提交再建置。
# Commit changes to the given files on the data branch and push. Usage: push-data.sh "message" file...
# "[skip ci]" is appended so neither GitHub Actions CI nor Cloudflare Pages builds for this commit.
set -euo pipefail

msg="$1"
shift

if git diff --quiet -- "$@"; then
  echo "No change."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -- "$@"
git commit -m "$msg [skip ci]"

# 別的流程可能剛推過 data 分支，先接上再推 / Another workflow may have just pushed to data; rebase onto it first
if git ls-remote --exit-code --heads origin data >/dev/null 2>&1; then
  git pull --rebase origin data
fi
git push origin HEAD:refs/heads/data
