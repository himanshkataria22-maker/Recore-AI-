#!/usr/bin/env bash
# ==============================================================================
# ReCore AI - Full Backend API Smoke Test Suite
# Tests every REST endpoint and verifies HTTP 200 responses.
# ==============================================================================

BASE_URL="http://localhost:8000/api"
FAIL_COUNT=0
PASS_COUNT=0

echo "========================================================"
echo " Starting ReCore AI Backend Smoke Tests: $BASE_URL"
echo "========================================================"

test_endpoint() {
  local METHOD=$1
  local ENDPOINT=$2
  local DATA=$3
  local DESC=$4

  printf "%-8s %-42s " "$METHOD" "$ENDPOINT"

  if [ "$METHOD" == "GET" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ENDPOINT")
  else
    if [ -n "$DATA" ]; then
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "$BASE_URL$ENDPOINT" -H "Content-Type: application/json" -d "$DATA")
    else
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "$BASE_URL$ENDPOINT")
    fi
  fi

  if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    echo " [PASS] (HTTP $HTTP_CODE)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo " [FAIL] (HTTP $HTTP_CODE)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# 1. System Health
test_endpoint "GET" "/health" "" "Health Check"

# 2. Project Summary
test_endpoint "GET" "/project/summary" "" "Dashboard Project Summary"

# 3. Discovered Modules
test_endpoint "GET" "/modules" "" "List Codebase Modules"
test_endpoint "GET" "/modules/discounts" "" "Get Single Module: discounts"
test_endpoint "GET" "/modules/billing" "" "Get Single Module: billing"

# 4. Business Rules
test_endpoint "GET" "/business-rules" "" "All Extracted Business Rules"
test_endpoint "GET" "/business-rules?moduleId=discounts" "" "Business Rules for discounts.py"
test_endpoint "GET" "/modules/billing/rules" "" "Module Rules: billing.py"

# 5. Dependency Graph
test_endpoint "GET" "/graph" "" "Dependency Graph & Nodes"

# 6. Modernization Plan
test_endpoint "GET" "/plan" "" "Prioritized Modernization Plan"

# 7. Blast Radius
test_endpoint "GET" "/blast-radius/db_utils" "" "Blast Radius: db_utils"
test_endpoint "GET" "/blast-radius/discounts" "" "Blast Radius: discounts"

# 8. Behavioral Test Generation
test_endpoint "POST" "/modules/discounts/generate-tests" "" "Generate Behavioral Tests"

# 9. Modernization & Validation
test_endpoint "POST" "/modules/discounts/modernize" "" "Synthesize Modernized discounts.py"
test_endpoint "GET" "/validation/discounts" "" "Get discounts ValidationRun"

# 10. Approval & Rollback
test_endpoint "POST" "/validation/discounts/approve" '{"status": "approved", "notes": "Automated smoke test sign-off", "reviewerName": "qa_lead"}' "Approve discounts.py"
test_endpoint "POST" "/modules/discounts/rollback" "" "Rollback discounts.py to v0"

# 11. Codebase Analysis Trigger
test_endpoint "POST" "/analyze" '{}' "Trigger AST Static Analysis"

echo "========================================================"
echo " Smoke Test Summary: $PASS_COUNT Passed, $FAIL_COUNT Failed"
echo "========================================================"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
else
  exit 0
fi
