#!/usr/bin/env python3
"""
ECO Platform Cabinet Regression Test
=====================================
Tests all three cabinets (ADMIN, MANAGER, CLIENT) + public site + ECO core logic
after VIN-ingestion cleanup to verify NO regression.

Requirements:
- ADMIN cabinet: login, dashboard KPIs, navigate sections
- MANAGER cabinet: login, role-gated sidebar, leads/deals
- CLIENT cabinet: dev-login, overview, requests, documents, profile
- PUBLIC site: home, waste catalog, calculator
- ECO CORE LOGIC: categories, search, license check, pricing, stats
- REGRESSION: removed auto endpoints should return 404
"""
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

BASE_URL = "https://code-audit-preview-6.preview.emergentagent.com"

# Test credentials
ADMIN_CREDS = {"email": "admin@bibi.cars", "password": "Admin12345!"}
MANAGER_CREDS = {"email": "manager@bibi.cars", "password": "Manager12345!"}
CLIENT_DEV_LOGIN = {"email": "client@acme.ua", "name": "Acme Test", "company_name": "Acme LLC"}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

class ECOCabinetTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.admin_token = None
        self.manager_token = None
        self.client_token = None
        self.failed_tests = []
        self.warnings = []

    def log(self, msg, color=Colors.BLUE):
        print(f"{color}{msg}{Colors.END}")

    def req(self, method, path, token=None, body=None, params=None, expect_json=True):
        """Make HTTP request"""
        import urllib.parse
        url = BASE_URL + path
        if params:
            query = urllib.parse.urlencode(params)
            url = f"{url}?{query}"
        
        data = json.dumps(body).encode() if body is not None else None
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "ECO-Test-Suite/1.0",
            "Accept": "application/json"
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read().decode()
                if expect_json:
                    try:
                        return r.status, json.loads(body)
                    except:
                        return r.status, body
                return r.status, body
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if expect_json:
                try:
                    return e.code, json.loads(body)
                except:
                    return e.code, body
            return e.code, body
        except Exception as e:
            return -1, str(e)

    def test(self, name, method, path, expected_status, token=None, body=None, params=None, check_keys=None):
        """Run a single test"""
        self.tests_run += 1
        status, resp = self.req(method, path, token, body, params)
        
        success = status == expected_status
        if success and check_keys and isinstance(resp, dict):
            for key in check_keys:
                if key not in resp:
                    success = False
                    self.warnings.append(f"{name}: missing key '{key}' in response")
        
        if success:
            self.tests_passed += 1
            self.log(f"✅ {name} → {status}", Colors.GREEN)
        else:
            self.tests_failed += 1
            self.failed_tests.append((name, expected_status, status))
            self.log(f"❌ {name} → expected {expected_status}, got {status}", Colors.RED)
            if isinstance(resp, dict) and "detail" in resp:
                print(f"   Error: {resp['detail']}")
        
        return success, status, resp

    def run_all_tests(self):
        """Run all cabinet regression tests"""
        self.log("\n" + "="*80, Colors.CYAN)
        self.log("ECO PLATFORM CABINET REGRESSION TEST", Colors.CYAN)
        self.log("Testing: ADMIN, MANAGER, CLIENT cabinets + PUBLIC + ECO core + regression", Colors.CYAN)
        self.log("="*80 + "\n", Colors.CYAN)

        # ============================================================
        # 1. ADMIN CABINET
        # ============================================================
        self.log("\n📋 SECTION 1: ADMIN CABINET", Colors.YELLOW)
        
        # Admin login
        success, status, resp = self.test(
            "Admin login (admin@bibi.cars)",
            "POST", "/api/auth/login", 200,
            body=ADMIN_CREDS,
            check_keys=["access_token"]
        )
        if success and isinstance(resp, dict):
            self.admin_token = resp.get("access_token")
            self.log(f"   ✓ Admin token acquired", Colors.GREEN)
        
        if not self.admin_token:
            self.log("❌ CRITICAL: Admin login failed, cannot continue", Colors.RED)
            self.print_summary()
            return 1

        # Admin /app redirect check (should go to dashboard)
        success, status, resp = self.test(
            "Admin GET /api/auth/me (verify role=admin)",
            "GET", "/api/auth/me", 200,
            token=self.admin_token,
            check_keys=["role", "email"]
        )
        if success and isinstance(resp, dict):
            role = resp.get("role", "").lower()
            if role == "admin":
                self.log(f"   ✓ Admin role confirmed: {resp.get('email')}", Colors.GREEN)

        # Dashboard KPIs
        success, status, resp = self.test(
            "Admin dashboard KPIs (GET /api/waste/stats)",
            "GET", "/api/waste/stats", 200,
            token=self.admin_token,
            check_keys=["success", "codes", "hazardous_codes", "licenses"]
        )
        if success and isinstance(resp, dict):
            codes = resp.get("codes", 0)
            hazardous = resp.get("hazardous_codes", 0)
            licenses = resp.get("licenses", 0)
            self.log(f"   ✓ KPIs: codes={codes}, hazardous={hazardous}, licenses={licenses}", Colors.GREEN)
            # Verify expected counts from review_request
            if codes < 800:
                self.warnings.append(f"Expected codes≈895, got {codes}")
            if hazardous < 400:
                self.warnings.append(f"Expected hazardous≈432, got {hazardous}")
            if licenses < 30:
                self.warnings.append(f"Expected licenses≈35, got {licenses}")

        # Navigate sidebar sections
        self.test("Admin → Companies (/api/waste/companies)", "GET", "/api/waste/companies", 200, token=self.admin_token)
        self.test("Admin → Requests (/api/waste/requests)", "GET", "/api/waste/requests", 200, token=self.admin_token)
        self.test("Admin → Operations contracts (/api/waste/contracts)", "GET", "/api/waste/contracts", 200, token=self.admin_token)
        self.test("Admin → Directory objects (/api/waste/objects)", "GET", "/api/waste/objects", 200, token=self.admin_token)
        self.test("Admin → Pricing rules (/api/waste/price_rules)", "GET", "/api/waste/price_rules", 200, token=self.admin_token)
        self.test("Admin → Licenses matrix (/api/waste/licenses)", "GET", "/api/waste/licenses", 200, token=self.admin_token)
        self.test("Admin → CRM tasks (/api/tasks)", "GET", "/api/tasks", 200, token=self.admin_token)

        # ============================================================
        # 2. MANAGER CABINET
        # ============================================================
        self.log("\n📋 SECTION 2: MANAGER CABINET", Colors.YELLOW)
        
        # Manager login
        success, status, resp = self.test(
            "Manager login (manager@bibi.cars)",
            "POST", "/api/auth/login", 200,
            body=MANAGER_CREDS,
            check_keys=["access_token"]
        )
        if success and isinstance(resp, dict):
            self.manager_token = resp.get("access_token")
            self.log(f"   ✓ Manager token acquired", Colors.GREEN)
        
        if not self.manager_token:
            self.log("⚠️  Manager login failed, skipping manager tests", Colors.YELLOW)
        else:
            # Manager /app redirect check (should go to /app/cabinet)
            success, status, resp = self.test(
                "Manager GET /api/auth/me (verify role=manager)",
                "GET", "/api/auth/me", 200,
                token=self.manager_token,
                check_keys=["role", "email"]
            )
            if success and isinstance(resp, dict):
                role = resp.get("role", "").lower()
                if role == "manager":
                    self.log(f"   ✓ Manager role confirmed: {resp.get('email')}", Colors.GREEN)
                else:
                    self.warnings.append(f"Expected role=manager, got {role}")

            # Role-gated sidebar (Мій кабінет: Огляд/Мої ліди/Мої угоди)
            self.test("Manager → My Leads (/api/leads?mine=true)", "GET", "/api/leads", 200, token=self.manager_token, params={"mine": "true"})
            self.test("Manager → My Deals (/api/deals?mine=true)", "GET", "/api/deals", 200, token=self.manager_token, params={"mine": "true"})
            self.test("Manager → My Tasks (/api/tasks?mine=true)", "GET", "/api/tasks", 200, token=self.manager_token, params={"mine": "true"})

        # ============================================================
        # 3. CLIENT (USER) B2B CABINET
        # ============================================================
        self.log("\n📋 SECTION 3: CLIENT B2B CABINET", Colors.YELLOW)
        
        # Client dev-login
        success, status, resp = self.test(
            "Client dev-login (POST /api/client/dev-login)",
            "POST", "/api/client/dev-login", 200,
            body=CLIENT_DEV_LOGIN,
            check_keys=["success", "token"]
        )
        if success and isinstance(resp, dict):
            self.client_token = resp.get("token") or resp.get("sessionToken")
            self.log(f"   ✓ Client token acquired", Colors.GREEN)
        
        if not self.client_token:
            self.log("⚠️  Client dev-login failed, skipping client tests", Colors.YELLOW)
        else:
            # Client overview
            success, status, resp = self.test(
                "Client → Overview (/api/client/summary)",
                "GET", "/api/client/summary", 200,
                token=self.client_token,
                check_keys=["success", "summary"]
            )
            if success and isinstance(resp, dict):
                summary = resp.get("summary", {})
                self.log(f"   ✓ Summary: total={summary.get('total_requests')}, open={summary.get('open_requests')}, completed={summary.get('completed_requests')}", Colors.GREEN)

            # Client requests
            self.test("Client → Requests (/api/client/requests)", "GET", "/api/client/requests", 200, token=self.client_token)
            
            # Client documents
            self.test("Client → Documents (/api/client/documents)", "GET", "/api/client/documents", 200, token=self.client_token)
            
            # Client profile
            self.test("Client → Profile (/api/client/me)", "GET", "/api/client/me", 200, token=self.client_token)

        # ============================================================
        # 4. PUBLIC SITE
        # ============================================================
        self.log("\n📋 SECTION 4: PUBLIC SITE", Colors.YELLOW)
        
        # Public home (waste categories)
        success, status, resp = self.test(
            "Public → Waste categories (/api/waste/categories)",
            "GET", "/api/waste/categories", 200,
            check_keys=["success", "categories"]
        )
        if success and isinstance(resp, dict):
            categories = resp.get("categories", [])
            self.log(f"   ✓ Categories loaded: {len(categories)} categories", Colors.GREEN)

        # Public waste catalog
        self.test("Public → Waste codes (/api/waste/codes)", "GET", "/api/waste/codes", 200, params={"limit": "10"})
        
        # Public calculator (pricing meta)
        self.test("Public → Calculator pricing meta (/api/waste/pricing/meta)", "GET", "/api/waste/pricing/meta", 200)
        
        # Public contacts
        self.test("Public → Contacts (/api/public/contacts)", "GET", "/api/public/contacts", 200)

        # ============================================================
        # 5. ECO CORE LOGIC (backend APIs)
        # ============================================================
        self.log("\n📋 SECTION 5: ECO CORE LOGIC", Colors.YELLOW)
        
        # Waste categories (public, 200)
        self.test("ECO → GET /api/waste/categories (public)", "GET", "/api/waste/categories", 200)
        
        # Waste search
        success, status, resp = self.test(
            "ECO → GET /api/waste/search?q=акумулятор",
            "GET", "/api/waste/search", 200,
            params={"q": "акумулятор"},
            check_keys=["success", "items"]
        )
        if success and isinstance(resp, dict):
            items = resp.get("items", [])
            self.log(f"   ✓ Search results: {len(items)} codes found", Colors.GREEN)

        # License check
        success, status, resp = self.test(
            "ECO → GET /api/waste/license/check?code=06 04 04*",
            "GET", "/api/waste/license/check", 200,
            params={"code": "06 04 04*"},
            check_keys=["success", "accepted"]
        )
        if success and isinstance(resp, dict):
            accepted = resp.get("accepted")
            self.log(f"   ✓ License check: accepted={accepted}", Colors.GREEN)

        # Price estimate
        success, status, resp = self.test(
            "ECO → POST /api/waste/price (pricing engine)",
            "POST", "/api/waste/price", 200,
            body={"code": "06 04 04*", "qty_kg": 500, "region": "kyiv"},
            check_keys=["success"]
        )
        if success and isinstance(resp, dict):
            self.log(f"   ✓ Pricing engine working", Colors.GREEN)

        # Waste stats (admin token)
        self.test("ECO → GET /api/waste/stats (admin)", "GET", "/api/waste/stats", 200, token=self.admin_token)

        # ============================================================
        # 6. REGRESSION (removed auto endpoints must stay 404)
        # ============================================================
        self.log("\n📋 SECTION 6: REGRESSION (auto endpoints should be 404)", Colors.YELLOW)
        
        auto_endpoints = [
            ("GET", "/api/scraped/vehicles"),
            ("GET", "/api/calculator/ports"),
            ("GET", "/api/v2/search/TESTVIN123"),
            ("GET", "/api/source-health"),
        ]
        
        for method, path in auto_endpoints:
            status, resp = self.req(method, path, token=self.admin_token)
            if status == 404:
                self.tests_passed += 1
                self.log(f"✅ {method} {path} → 404 (correctly removed)", Colors.GREEN)
            else:
                self.tests_failed += 1
                self.failed_tests.append((f"REGRESSION: {path}", 404, status))
                self.log(f"❌ {method} {path} → expected 404, got {status} (STILL ALIVE!)", Colors.RED)
            self.tests_run += 1

        # ============================================================
        # SUMMARY
        # ============================================================
        self.print_summary()
        return 0 if self.tests_failed == 0 else 1

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        self.log("📊 TEST SUMMARY", Colors.CYAN)
        print("="*80)
        print(f"Total tests run:    {self.tests_run}")
        self.log(f"Tests passed:       {self.tests_passed} ✅", Colors.GREEN)
        
        if self.tests_failed > 0:
            self.log(f"Tests failed:       {self.tests_failed} ❌", Colors.RED)
            print("\nFailed tests:")
            for name, expected, actual in self.failed_tests:
                self.log(f"  - {name} (expected {expected}, got {actual})", Colors.RED)
        else:
            self.log("All tests passed! 🎉", Colors.GREEN)
        
        if self.warnings:
            self.log(f"\nWarnings:           {len(self.warnings)} ⚠️", Colors.YELLOW)
            for warning in self.warnings:
                self.log(f"  - {warning}", Colors.YELLOW)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\nSuccess rate:       {success_rate:.1f}%")
        print("="*80 + "\n")

def main():
    tester = ECOCabinetTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
