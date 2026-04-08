#!/bin/bash
# Feature implementation verification script
# Usage: bash .github/skills/feature-implementation/scripts/verify.sh

set -e

echo "=== Verification Start ==="

echo ""
echo "--- Type Check ---"
npm run type-check 2>&1 || { echo "❌ Type check failed"; exit 1; }
echo "✅ Type check passed"

echo ""
echo "--- Lint ---"
npm run lint 2>&1 || { echo "❌ Lint failed"; exit 1; }
echo "✅ Lint passed"

echo ""
echo "--- Test ---"
npm run test 2>&1 || { echo "❌ Tests failed"; exit 1; }
echo "✅ Tests passed"

echo ""
echo "--- Build ---"
npm run build 2>&1 || { echo "❌ Build failed"; exit 1; }
echo "✅ Build passed"

echo ""
echo "=== All Verifications Passed ✅ ==="
