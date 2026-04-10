#!/bin/bash
# Compare the two commits to find what files were added/modified
git diff --name-status 6ea6ecb116415a26730fd4c1f42489a7adf765fb d455814f89bc06f4ac64f44e6a068cc7b394b9fc | grep -E '(Window|Desktop|App|dashboard)' -i
echo "---"
git diff --name-status 6ea6ecb116415a26730fd4c1f42489a7adf765fb d455814f89bc06f4ac64f44e6a068cc7b394b9fc | head -100
