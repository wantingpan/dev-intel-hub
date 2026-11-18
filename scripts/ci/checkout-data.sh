#!/usr/bin/env bash
# 自動資料更新用：切到 data 分支，並先把 main 的最新內容併進來。
# 自動同步只寫到 data 分支，不會觸發部署；publish-data 流程會定時把 data 合併到 main 才部署。
# For automatic data updates: switch to the data branch and bring main's latest into it.
# Syncs write to the data branch only, which doesn't deploy; the publish-data workflow merges data into main on a schedule, and that is what deploys.
#
# 需要先用 actions/checkout（fetch-depth: 0）取得完整歷史。data 分支不存在時會從 main 建立。
# Needs actions/checkout with fetch-depth: 0. The data branch is created from main when it doesn't exist.
set -euo pipefail

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git fetch origin main

if git ls-remote --exit-code --heads origin data >/dev/null 2>&1; then
  git fetch origin data
  git checkout -B data origin/data
else
  echo "No data branch yet; creating it from main."
  git checkout -B data origin/main
fi

# main 有新內容（例如合併了功能分支）時併進來；衝突時中止，讓這次執行顯示為失敗
# Bring main in when it has new commits (for example a merged feature branch); abort on conflict so the run fails
if ! git merge --no-edit -m "Merge main into data [skip ci]" origin/main; then
  git merge --abort || true
  echo "Merging main into data hit a conflict. Resolve it by hand."
  exit 1
fi
