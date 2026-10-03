# ==============================================================================
# ReCore AI - Full Backend API Smoke Test Suite (PowerShell / Windows)
# Tests every REST endpoint and verifies HTTP 200 responses.
# ==============================================================================

$BaseUrl = "http://localhost:8000/api"
$PassCount = 0
$FailCount = 0

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting ReCore AI Backend Smoke Tests: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

function Test-Endpoint {
    param (
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [string]$Desc
    )

    $url = "$BaseUrl$Endpoint"
    $methodPad = $Method.PadRight(6)
    $endpointPad = $Endpoint.PadRight(38)

    try {
        if ($Method -eq "GET") {
            $resp = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec 15
        } else {
            if ($Body) {
                $resp = Invoke-WebRequest -Uri $url -Method $Method -Body $Body -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
            } else {
                $resp = Invoke-WebRequest -Uri $url -Method $Method -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
            }
        }

        $code = $resp.StatusCode
        if ($code -eq 200 -or $code -eq 201) {
            Write-Host " $methodPad $endpointPad [PASS] (HTTP $code)" -ForegroundColor Green
            $script:PassCount++
        } else {
            Write-Host " $methodPad $endpointPad [FAIL] (HTTP $code)" -ForegroundColor Red
            $script:FailCount++
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status) {
            Write-Host " $methodPad $endpointPad [FAIL] (HTTP $status)" -ForegroundColor Red
        } else {
            Write-Host " $methodPad $endpointPad [ERROR] ($($_.Exception.Message))" -ForegroundColor Red
        }
        $script:FailCount++
    }
}

# 1. System Health
Test-Endpoint "GET" "/health" $null "Health Check"

# 2. Project Summary
Test-Endpoint "GET" "/project/summary" $null "Dashboard Summary"

# 3. Discovered Modules
Test-Endpoint "GET" "/modules" $null "List Codebase Modules"
Test-Endpoint "GET" "/modules/discounts" $null "Get discounts.py"
Test-Endpoint "GET" "/modules/discounts/insights" $null "Explainable AI Insights"
Test-Endpoint "GET" "/modules/billing" $null "Get billing.py"

# 4. Business Rules
Test-Endpoint "GET" "/business-rules" $null "All Extracted Rules"
Test-Endpoint "GET" "/business-rules?moduleId=discounts" $null "Discounts Business Rules"
Test-Endpoint "GET" "/modules/billing/rules" $null "Billing Business Rules"

# 5. Dependency Graph
Test-Endpoint "GET" "/graph" $null "Dependency Graph"

# 6. Modernization Plan & Explanation
Test-Endpoint "GET" "/plan" $null "Modernization Plan"
Test-Endpoint "GET" "/plan/explain" $null "AI DAG Sequencing Rationale"

# 7. Blast Radius
Test-Endpoint "GET" "/blast-radius/db_utils" $null "Blast Radius: db_utils"
Test-Endpoint "GET" "/blast-radius/discounts" $null "Blast Radius: discounts"

# 8. Behavioral Tests
Test-Endpoint "POST" "/modules/discounts/generate-tests" $null "Generate Behavioral Tests"

# 9. Modernization & Validation
Test-Endpoint "POST" "/modules/discounts/modernize" $null "Modernize discounts.py"
Test-Endpoint "GET" "/validation/discounts" $null "ValidationRun discounts"

# 10. Strangler Routing & Shadow Run
Test-Endpoint "GET" "/modules/discounts/route" $null "Get Strangler Route"
Test-Endpoint "POST" "/modules/discounts/route" '{"target":"legacy"}' "Set Route: Legacy"
Test-Endpoint "POST" "/modules/discounts/route" '{"target":"modernized"}' "Set Route: Modernized"
Test-Endpoint "POST" "/modules/discounts/shadow-run" $null "Run Shadow Comparison"
Test-Endpoint "GET" "/modules/discounts/report" $null "Download Audit Report (.md)"

# 11. Approval & Rollback
Test-Endpoint "POST" "/validation/discounts/approve" '{"status":"approved","notes":"Smoke test sign-off","reviewerName":"lead_qa"}' "Approve discounts"
Test-Endpoint "POST" "/modules/discounts/rollback" $null "Rollback discounts"

# 12. AST Trigger
Test-Endpoint "POST" "/analyze" '{}' "Trigger AST Analysis"

Write-Host "========================================================" -ForegroundColor Cyan
if ($FailCount -gt 0) {
    Write-Host " Smoke Test Summary: $PassCount Passed, $FailCount Failed" -ForegroundColor Red
} else {
    Write-Host " Smoke Test Summary: $PassCount Passed, $FailCount Failed" -ForegroundColor Green
}
Write-Host "========================================================" -ForegroundColor Cyan

if ($FailCount -gt 0) {
    exit 1
} else {
    exit 0
}
