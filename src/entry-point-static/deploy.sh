#!/bin/bash
set -e

TARGET_REMOTE=$(git config remote.origin.url)
TARGET_BRANCH=gh-pages

current_commit=$(git rev-parse HEAD)

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working directory unclean"
  exit 1
fi

pushd dist > /dev/null

git init
git fetch --quiet "$TARGET_REMOTE" "$TARGET_BRANCH"
git symbolic-ref HEAD "refs/heads/$TARGET_BRANCH"
git reset --hard FETCH_HEAD
rm -rf -- *

popd > /dev/null

echo
yarn build
echo

pushd dist > /dev/null

git add --all
git commit -m "Build from $current_commit"
git push "$TARGET_REMOTE" HEAD:"$TARGET_BRANCH"

popd > /dev/null
