#!/bin/bash
# Pipeline validation script
# Usage: bash .github/skills/devops-delivery/scripts/validate-pipeline.sh

set -e

echo "=== Pipeline Validation Start ==="

echo ""
echo "--- Checking workflow files ---"
if ls .github/workflows/*.yml 1>/dev/null 2>&1; then
  for f in .github/workflows/*.yml; do
    echo "Found: $f"
    if command -v python3 &>/dev/null; then
      python3 -c "import yaml; yaml.safe_load(open('$f'))" 2>&1 && echo "  ✅ Valid YAML" || echo "  ❌ Invalid YAML"
    fi
  done
else
  echo "⚠️ No workflow files found"
fi

echo ""
echo "--- Checking environment files ---"
if [ -f ".env.example" ]; then
  echo "✅ .env.example exists"
else
  echo "⚠️ .env.example not found"
fi

if [ -f ".env" ]; then
  echo "⚠️ .env file exists - make sure it's in .gitignore"
else
  echo "✅ No .env file (good)"
fi

echo ""
echo "=== Pipeline Validation Complete ==="
