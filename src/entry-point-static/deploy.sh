#!/bin/bash
set -e

TARGET_REMOTE=$(git config remote.origin.url)
TARGET_BRANCH=gh-pages

current_commit=$(git rev-parse --short HEAD)

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working directory unclean"
  exit 1
fi

mkdir -p dist

pushd dist > /dev/null

# The next few lines ensure that:
# - dist/ is a git repo
# - dist/ is checked out to the latest commit on branch $TARGET_BRANCH
# - dist/ has no files in it (except for .git)
git init
git symbolic-ref HEAD "refs/heads/$TARGET_BRANCH"
git fetch --quiet "$TARGET_REMOTE" "$TARGET_BRANCH"
git reset --hard FETCH_HEAD
rm -rf -- *

popd > /dev/null

echo
yarn build
echo

pushd dist > /dev/null

git add --all
if ! git commit -m "Build from $current_commit"; then
  echo 'Something went wrong. Perhaps already deployed?'
  exit 1
fi
git push "$TARGET_REMOTE" HEAD:"$TARGET_BRANCH"

popd > /dev/null
