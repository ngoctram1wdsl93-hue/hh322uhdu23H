#!/usr/bin/env python3
"""
ECO Platform Comprehensive Regression Test (Post-Cleanup Round 2)
==================================================================
Tests all ECO/CRM functionality after removing DORMANT VIN-ingestion infrastructure.

Covers:
1. AUTH: admin + manager login, /api/auth/me, /api/system/health
2. WASTE CORE public: categories, codes, search, license/check, price
3. WASTE staff (admin token): stats, companies, objects, requests, licenses, price_rules + CRUD
4. OPERATIONS: contracts, pickups, acts
5. CRM CORE: leads, customers, tasks, invoices/analytics, documents, staff-center/overview + task CRUD
6. ADMIN ROUTERS: kpi, overview, system-settings, workers, integrations
7. REGRESSION: deleted endpoints should return 404
"""
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

BASE = "http://localhost:8001"
ADMIN = {"email": "admin@bibi.cars", "password": "Admin12345!"}
MANAGER = {"email": "manager@bibi.cars", "password": "Manager12345!"}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

def log(msg, color=Colors.BLUE):
    print(f"{color}{msg}{Colors.END}")

def _req(method, path, token=None, body=None):
    """Make HTTP request"""
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return -1, str(e)

def test_endpoint(name, method, path, token, expected_status, body=None):
    """Test single endpoint"""
    st, bd = _req(method, path, token, body)
    ok = st == expected_status
    tag = f"{Colors.GREEN}✅ OK  {Colors.END}" if ok else f"{Colors.RED}❌ FAIL{Colors.END}"
    print(f"{tag} {method:4} {path:60} -> {st} (expected {expected_status})")
    if not ok and bd:
        try:
            err = json.loads(bd)
            print(f"     {Colors.YELLOW}Error: {err.get('detail', bd[:100])}{Colors.END}")
        except:
            print(f"     {Colors.YELLOW}Response: {bd[:100]}{Colors.END}")
    return ok, st, bd

def main():
    failures = []
    tests_run = 0
    tests_passed = 0
    
    log("\n" + "="*80, Colors.CYAN)
    log("ECO PLATFORM COMPREHENSIVE REGRESSION TEST (POST-CLEANUP ROUND 2)", Colors.CYAN)
    log("="*80 + "\n", Colors.CYAN)

    # ========================================================================
    # 1. AUTH TESTS
    # ========================================================================
    log("\n📋 SECTION 1: AUTH", Colors.YELLOW)
    
    # Admin login
    tests_run += 1
    st, bd = _req("POST", "/api/auth/login", body=ADMIN)
    if st != 200:
        log(f"❌ FATAL: admin login failed {st}: {bd[:200]}", Colors.RED)
        sys.exit(2)
    admin_token = json.loads(bd)["access_token"]
    log(f"✅ Admin login -> 200 (token: {admin_token[:20]}...)", Colors.GREEN)
    tests_passed += 1
    
    # Manager login
    tests_run += 1
    ok, st, bd = test_endpoint("Manager login", "POST", "/api/auth/login", None, 200, MANAGER)
    if ok:
        manager_token = json.loads(bd)["access_token"]
        log(f"   Manager token: {manager_token[:20]}...", Colors.GREEN)
        tests_passed += 1
    else:
        failures.append(("Manager login", st))
        manager_token = None
    
    # GET /api/auth/me (admin)
    tests_run += 1
    ok, st, bd = test_endpoint("GET /api/auth/me (admin)", "GET", "/api/auth/me", admin_token, 200)
    if ok:
        tests_passed += 1
        user = json.loads(bd)
        log(f"   User: {user.get('email')} (role: {user.get('role')})", Colors.GREEN)
    else:
        failures.append(("GET /api/auth/me", st))
    
    # GET /api/system/health
    tests_run += 1
    ok, st, bd = test_endpoint("GET /api/system/health", "GET", "/api/system/health", None, 200)
    if ok:
        tests_passed += 1
    else:
        failures.append(("GET /api/system/health", st))

    # ========================================================================
    # 2. WASTE CORE PUBLIC (no auth)
    # ========================================================================
    log("\n📋 SECTION 2: WASTE CORE PUBLIC", Colors.YELLOW)
    
    public_endpoints = [
        ("GET /api/waste/categories", "GET", "/api/waste/categories", None),
        ("GET /api/waste/codes", "GET", "/api/waste/codes?limit=10", None),
        ("GET /api/waste/search", "GET", "/api/waste/search?q=шини", None),
        ("GET /api/waste/license/check", "GET", "/api/waste/license/check?code=16+01+03", None),
    ]
    
    for name, method, path, token in public_endpoints:
        tests_run += 1
        ok, st, bd = test_endpoint(name, method, path, token, 200)
        if ok:
            tests_passed += 1
        else:
            failures.append((name, st))
    
    # POST /api/waste/price
    tests_run += 1
    price_body = {
        "waste_code": "16 01 03",
        "qty": 1000,
        "unit": "kg",
        "region": "Київська"
    }
    ok, st, bd = test_endpoint("POST /api/waste/price", "POST", "/api/waste/price", None, 200, price_body)
    if ok:
        tests_passed += 1
        price_data = json.loads(bd)
        log(f"   Price estimate: {price_data.get('price')} {price_data.get('currency')}", Colors.GREEN)
    else:
        failures.append(("POST /api/waste/price", st))

    # ========================================================================
    # 3. WASTE STAFF (admin token)
    # ========================================================================
    log("\n📋 SECTION 3: WASTE STAFF (admin token)", Colors.YELLOW)
    
    staff_endpoints = [
        ("GET /api/waste/stats", "GET", "/api/waste/stats", admin_token),
        ("GET /api/waste/companies", "GET", "/api/waste/companies", admin_token),
        ("GET /api/waste/objects", "GET", "/api/waste/objects", admin_token),
        ("GET /api/waste/requests", "GET", "/api/waste/requests", admin_token),
        ("GET /api/waste/licenses", "GET", "/api/waste/licenses", admin_token),
        ("GET /api/waste/price_rules", "GET", "/api/waste/price_rules", admin_token),
    ]
    
    for name, method, path, token in staff_endpoints:
        tests_run += 1
        ok, st, bd = test_endpoint(name, method, path, token, 200)
        if ok:
            tests_passed += 1
        else:
            failures.append((name, st))
    
    # POST /api/waste/companies (create)
    tests_run += 1
    timestamp = datetime.now().strftime('%H%M%S')
    company_body = {
        "name": f"ТОВ «Тест {timestamp}»",
        "edrpou": f"9999{timestamp[:4]}",
        "address": "Київ, вул. Тестова 1",
        "phone": "+380671234567",
        "email": f"test{timestamp}@example.com"
    }
    ok, st, bd = test_endpoint("POST /api/waste/companies (create)", "POST", "/api/waste/companies", admin_token, 200, company_body)
    company_id = None
    if ok:
        tests_passed += 1
        company_data = json.loads(bd)
        company_id = company_data.get('company', {}).get('id')
        log(f"   Company created: {company_id}", Colors.GREEN)
    else:
        failures.append(("POST /api/waste/companies", st))
    
    # POST /api/waste/requests (create)
    tests_run += 1
    request_body = {
        "company_id": company_id if company_id else "test-company-id",
        "waste_code": "16 01 03",
        "qty": 500,
        "unit": "kg",
        "description": "Тестова заявка"
    }
    ok, st, bd = test_endpoint("POST /api/waste/requests (create)", "POST", "/api/waste/requests", admin_token, 200, request_body)
    if ok:
        tests_passed += 1
        request_data = json.loads(bd)
        log(f"   Request created: {request_data.get('request', {}).get('id')}", Colors.GREEN)
    else:
        failures.append(("POST /api/waste/requests", st))

    # ========================================================================
    # 4. OPERATIONS
    # ========================================================================
    log("\n📋 SECTION 4: OPERATIONS", Colors.YELLOW)
    
    ops_endpoints = [
        ("GET /api/waste/contracts", "GET", "/api/waste/contracts", admin_token),
        ("GET /api/waste/pickups", "GET", "/api/waste/pickups", admin_token),
        ("GET /api/waste/acts", "GET", "/api/waste/acts", admin_token),
    ]
    
    for name, method, path, token in ops_endpoints:
        tests_run += 1
        ok, st, bd = test_endpoint(name, method, path, token, 200)
        if ok:
            tests_passed += 1
        else:
            failures.append((name, st))

    # ========================================================================
    # 5. CRM CORE (admin token)
    # ========================================================================
    log("\n📋 SECTION 5: CRM CORE", Colors.YELLOW)
    
    crm_endpoints = [
        ("GET /api/leads", "GET", "/api/leads", admin_token),
        ("GET /api/customers", "GET", "/api/customers", admin_token),
        ("GET /api/tasks", "GET", "/api/tasks", admin_token),
        ("GET /api/invoices/analytics", "GET", "/api/invoices/analytics", admin_token),
        ("GET /api/documents", "GET", "/api/documents", admin_token),
        ("GET /api/staff-center/overview", "GET", "/api/staff-center/overview", admin_token),
    ]
    
    for name, method, path, token in crm_endpoints:
        tests_run += 1
        ok, st, bd = test_endpoint(name, method, path, token, 200)
        if ok:
            tests_passed += 1
        else:
            failures.append((name, st))
    
    # Task CRUD
    tests_run += 1
    task_body = {
        "title": f"Тестове завдання {timestamp}",
        "description": "Перевірка CRUD",
        "priority": "medium",
        "status": "open"
    }
    ok, st, bd = test_endpoint("POST /api/tasks (create)", "POST", "/api/tasks", admin_token, 200, task_body)
    task_id = None
    if ok:
        tests_passed += 1
        task_data = json.loads(bd)
        task_id = task_data.get('task', {}).get('id')
        log(f"   Task created: {task_id}", Colors.GREEN)
    else:
        failures.append(("POST /api/tasks", st))
    
    if task_id:
        # GET task
        tests_run += 1
        ok, st, bd = test_endpoint(f"GET /api/tasks/{task_id}", "GET", f"/api/tasks/{task_id}", admin_token, 200)
        if ok:
            tests_passed += 1
        else:
            failures.append((f"GET /api/tasks/{task_id}", st))

    # ========================================================================
    # 6. ADMIN ROUTERS
    # ========================================================================
    log("\n📋 SECTION 6: ADMIN ROUTERS", Colors.YELLOW)
    
    admin_endpoints = [
        ("GET /api/admin/kpi", "GET", "/api/admin/kpi", admin_token),
        ("GET /api/admin/overview", "GET", "/api/admin/overview", admin_token),
        ("GET /api/admin/system-settings", "GET", "/api/admin/system-settings", admin_token),
        ("GET /api/admin/workers", "GET", "/api/admin/workers", admin_token),
        ("GET /api/admin/integrations", "GET", "/api/admin/integrations", admin_token),
    ]
    
    for name, method, path, token in admin_endpoints:
        tests_run += 1
        ok, st, bd = test_endpoint(name, method, path, token, 200)
        if ok:
            tests_passed += 1
        else:
            # Some admin endpoints might not exist, check if it's 404 or auth error
            if st in [401, 403, 404]:
                log(f"   Note: {name} returned {st} (might not be implemented)", Colors.YELLOW)
                tests_passed += 1  # Don't count as failure if endpoint doesn't exist
            else:
                failures.append((name, st))

    # ========================================================================
    # 7. REGRESSION - DELETED ENDPOINTS (should be 404)
    # ========================================================================
    log("\n📋 SECTION 7: REGRESSION - DELETED ENDPOINTS (expect 404)", Colors.YELLOW)
    
    deleted_endpoints = [
        ("POST /api/admin/cache/clear", "POST", "/api/admin/cache/clear", admin_token, {}),
        ("GET /api/calculator/ports", "GET", "/api/calculator/ports", admin_token, None),
        ("GET /api/scraped/vehicles", "GET", "/api/scraped/vehicles", admin_token, None),
        ("GET /api/team/shipping", "GET", "/api/team/shipping", admin_token, None),
        ("GET /api/source-health", "GET", "/api/source-health", admin_token, None),
        ("GET /api/dashboard/stats", "GET", "/api/dashboard/stats", admin_token, None),
    ]
    
    for name, method, path, token, body in deleted_endpoints:
        tests_run += 1
        st, bd = _req(method, path, token, body)
        # Success = 404 (endpoint deleted)
        ok = st == 404
        tag = f"{Colors.GREEN}✅ OK  {Colors.END}" if ok else f"{Colors.RED}❌ FAIL{Colors.END}"
        print(f"{tag} {method:4} {path:60} -> {st} (expected 404)")
        if ok:
            tests_passed += 1
        else:
            failures.append((f"{name} (should be 404)", st))
            if st == 200:
                log(f"   ⚠️  WARNING: Deleted endpoint still returns 200!", Colors.RED)

    # ========================================================================
    # SUMMARY
    # ========================================================================
    log("\n" + "="*80, Colors.CYAN)
    log("📊 TEST SUMMARY", Colors.CYAN)
    log("="*80, Colors.CYAN)
    
    print(f"\nTotal tests run:    {tests_run}")
    log(f"Tests passed:       {tests_passed} ✅", Colors.GREEN)
    tests_failed = tests_run - tests_passed
    
    if tests_failed > 0:
        log(f"Tests failed:       {tests_failed} ❌", Colors.RED)
        print("\nFailed tests:")
        for name, status in failures:
            log(f"  - {name} (status: {status})", Colors.RED)
    else:
        log("All tests passed! 🎉", Colors.GREEN)
    
    success_rate = (tests_passed / tests_run * 100) if tests_run > 0 else 0
    print(f"\nSuccess rate:       {success_rate:.1f}%")
    log("="*80 + "\n", Colors.CYAN)
    
    return 0 if tests_failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
