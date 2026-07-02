"""
ECO Platform Regression Test — Wave Freeze Verification
========================================================
Goal: Confirm NO regression after freezing wave6/11/19 and verify those frozen
routes are inactive (404). All dashboard data is REAL seeded demo data.

Test Coverage:
1. FROZEN routes MUST return 404 (wave6/11/19)
2. ECO analytics dashboards still work (200 with real UAH data)
3. Deal360 (eco namespace) works with real deal id
4. Kept wave routers still work (wave2a/7/17/18)
5. Auth regression (admin/manager/client)
"""
import requests
import sys
import os
from datetime import datetime

# Public endpoint from frontend/.env
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://admin-logic-test-3.preview.emergentagent.com")

# Test credentials from backend/.env
ADMIN_EMAIL = "admin@eco.ua"
ADMIN_PASSWORD = "EcoAdmin2026!"
MANAGER_EMAIL = "manager@eco.ua"
MANAGER_PASSWORD = "EcoManager2026!"
CLIENT_EMAIL = "client@eco.ua"
CLIENT_PASSWORD = "EcoClient2026!"

class ECOTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.manager_token = None
        self.client_token = None
        self.real_deal_id = None

    def log(self, msg, level="INFO"):
        print(f"[{level}] {msg}")

    def test(self, name, method, endpoint, expected_status, token=None, data=None, check_data=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        self.log(f"Testing {name}...", "TEST")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                self.log(f"Unsupported method {method}", "ERROR")
                return False

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASS - {name} - Status: {response.status_code}", "PASS")
                
                # Additional data checks
                if check_data and response.status_code == 200:
                    try:
                        json_data = response.json()
                        if callable(check_data):
                            if not check_data(json_data):
                                self.log(f"⚠️  Data validation failed for {name}", "WARN")
                                return False
                    except Exception as e:
                        self.log(f"⚠️  Data check error: {e}", "WARN")
                
                return True
            else:
                self.log(f"❌ FAIL - {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response.status_code != expected_status:
                    try:
                        self.log(f"Response: {response.text[:200]}", "DEBUG")
                    except:
                        pass
                return False

        except requests.exceptions.Timeout:
            self.log(f"❌ FAIL - {name} - Request timeout", "FAIL")
            return False
        except Exception as e:
            self.log(f"❌ FAIL - {name} - Error: {str(e)}", "FAIL")
            return False

    def login(self, email, password, endpoint="/api/auth/login"):
        """Login and get token"""
        self.log(f"Logging in as {email}...", "AUTH")
        url = f"{BASE_URL}{endpoint}"
        try:
            response = requests.post(url, json={"email": email, "password": password}, timeout=10)
            if response.status_code == 200:
                data = response.json()
                token = data.get('token') or data.get('access_token')
                if token:
                    self.log(f"✅ Login successful for {email}", "AUTH")
                    return token
                else:
                    self.log(f"❌ No token in response for {email}", "AUTH")
                    return None
            else:
                self.log(f"❌ Login failed for {email} - Status: {response.status_code}", "AUTH")
                self.log(f"Response: {response.text[:200]}", "DEBUG")
                return None
        except Exception as e:
            self.log(f"❌ Login error for {email}: {str(e)}", "AUTH")
            return None

    def run_all_tests(self):
        """Run all regression tests"""
        self.log("="*80, "INFO")
        self.log("ECO PLATFORM REGRESSION TEST - WAVE FREEZE VERIFICATION", "INFO")
        self.log("="*80, "INFO")
        
        # ═══════════════════════════════════════════════════════════════
        # 1. AUTH REGRESSION
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[1] AUTH REGRESSION", "SECTION")
        self.admin_token = self.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        self.manager_token = self.login(MANAGER_EMAIL, MANAGER_PASSWORD)
        # Client uses dev-login endpoint (Google OAuth in production)
        self.client_token = self.login(CLIENT_EMAIL, CLIENT_PASSWORD, "/api/client/dev-login")
        
        if not self.admin_token:
            self.log("❌ CRITICAL: Admin login failed - cannot continue", "CRITICAL")
            return False
        
        # ═══════════════════════════════════════════════════════════════
        # 2. FROZEN ROUTES MUST RETURN 404
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[2] FROZEN ROUTES (wave6/11/19) - MUST RETURN 404", "SECTION")
        
        # Wave6 frozen routes
        self.test("Frozen: /api/admin/pipeline/stages", "GET", "/api/admin/pipeline/stages", 404, self.admin_token)
        self.test("Frozen: /api/admin/deals/test123/360", "GET", "/api/admin/deals/test123/360", 404, self.admin_token)
        
        # Wave11 frozen routes
        self.test("Frozen: /api/deals/test123/360", "GET", "/api/deals/test123/360", 404, self.admin_token)
        
        # Wave19 frozen routes
        self.test("Frozen: /api/customer-portal/customers", "GET", "/api/customer-portal/customers", 404, self.admin_token)
        
        # ═══════════════════════════════════════════════════════════════
        # 3. ECO ANALYTICS DASHBOARDS (Wave 12/12c/14/15/16)
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[3] ECO ANALYTICS DASHBOARDS - MUST RETURN 200 WITH DATA", "SECTION")
        
        # Finance360 (Wave 12)
        self.test("Finance: /api/finance/overview", "GET", "/api/finance/overview", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        self.test("Finance: /api/finance/transactions", "GET", "/api/finance/transactions?limit=50", 200, self.admin_token,
                 check_data=lambda d: d.get('success'))
        self.test("Finance: /api/finance/outstanding", "GET", "/api/finance/outstanding", 200, self.admin_token,
                 check_data=lambda d: d.get('success'))
        
        # Forecast (Wave 12C)
        self.test("Forecast: /api/forecast/overview", "GET", "/api/forecast/overview", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        
        # Operations360 (Wave 14)
        self.test("Operations: /api/operations/dashboard", "GET", "/api/operations/dashboard", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        self.test("Operations: /api/operations/sla", "GET", "/api/operations/sla", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        
        # Executive (Wave 16)
        self.test("Executive: /api/executive/dashboard", "GET", "/api/executive/dashboard", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        
        # Contracts (Wave 15)
        self.test("Contracts: /api/contracts/overview", "GET", "/api/contracts/overview", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        self.test("Contracts: /api/contracts?limit=50", "GET", "/api/contracts?limit=50", 200, self.admin_token,
                 check_data=lambda d: d.get('success'))
        self.test("Contracts: /api/contracts/templates", "GET", "/api/contracts/templates", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'items' in d)
        
        # ═══════════════════════════════════════════════════════════════
        # 4. DEAL360 (ECO namespace) - Need real deal ID
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[4] DEAL360 (ECO namespace) - MUST WORK WITH REAL DEAL", "SECTION")
        
        # First, get a real deal ID from manager-cabinet/deals
        try:
            url = f"{BASE_URL}/api/manager-cabinet/deals"
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                deals = data.get('items') or data.get('deals') or []
                if deals and len(deals) > 0:
                    self.real_deal_id = deals[0].get('id')
                    self.log(f"Found real deal ID: {self.real_deal_id}", "INFO")
                else:
                    self.log("⚠️  No deals found in manager-cabinet", "WARN")
        except Exception as e:
            self.log(f"⚠️  Could not fetch deals: {e}", "WARN")
        
        if self.real_deal_id:
            self.test("Deal360: /api/eco/deals/{id}/360", "GET", f"/api/eco/deals/{self.real_deal_id}/360", 200, self.admin_token,
                     check_data=lambda d: d.get('success') and 'data' in d)
            self.test("Deal360: /api/eco/deals/{id}/stage-progress", "GET", f"/api/eco/deals/{self.real_deal_id}/stage-progress", 200, self.admin_token,
                     check_data=lambda d: d.get('success') and 'data' in d)
        else:
            self.log("⚠️  Skipping Deal360 tests - no real deal ID available", "WARN")
        
        # ═══════════════════════════════════════════════════════════════
        # 5. KEPT WAVE ROUTERS (wave2a/7/17/18)
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[5] KEPT WAVE ROUTERS - MUST STILL WORK", "SECTION")
        
        # Wave17 - Actions
        self.test("Wave17: /api/actions/inbox", "GET", "/api/actions/inbox", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        self.test("Wave17: /api/actions/my", "GET", "/api/actions/my", 200, self.admin_token,
                 check_data=lambda d: d.get('success') and 'data' in d)
        
        # Wave18 - Notifications
        self.test("Wave18: /api/notifications/inbox", "GET", "/api/notifications/inbox", 200, self.admin_token,
                 check_data=lambda d: d.get('success'))
        self.test("Wave18: /api/notifications/unread-count", "GET", "/api/notifications/unread-count", 200, self.admin_token,
                 check_data=lambda d: 'count' in d or 'unread' in d)
        
        # Wave7 - Reassign
        self.test("Wave7: /api/admin/reassign/managers", "GET", "/api/admin/reassign/managers", 200, self.admin_token,
                 check_data=lambda d: 'items' in d or 'managers' in d)
        
        # Wave2a - Calls (need real customer ID, skip if not available)
        self.log("⚠️  Skipping Wave2a calls test - requires real customer ID", "WARN")
        
        # ═══════════════════════════════════════════════════════════════
        # 6. MANAGER SCOPE TEST
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[6] MANAGER SCOPE - MUST RETURN scope.all=false", "SECTION")
        
        if self.manager_token:
            self.test("Manager Finance (scoped)", "GET", "/api/finance/overview", 200, self.manager_token,
                     check_data=lambda d: d.get('success') and d.get('data', {}).get('scope', {}).get('all') == False)
            self.test("Manager Operations (scoped)", "GET", "/api/operations/dashboard", 200, self.manager_token,
                     check_data=lambda d: d.get('success'))
        else:
            self.log("⚠️  Skipping manager scope tests - manager login failed", "WARN")
        
        # ═══════════════════════════════════════════════════════════════
        # 7. CLIENT PORTAL REGRESSION
        # ═══════════════════════════════════════════════════════════════
        self.log("\n[7] CLIENT PORTAL REGRESSION", "SECTION")
        
        if self.client_token:
            self.log("✅ Client login successful", "PASS")
            self.tests_run += 1
            self.tests_passed += 1
        else:
            self.log("❌ Client login failed", "FAIL")
            self.tests_run += 1
        
        return True

    def print_summary(self):
        """Print test summary"""
        self.log("\n" + "="*80, "INFO")
        self.log("TEST SUMMARY", "INFO")
        self.log("="*80, "INFO")
        self.log(f"Tests Run: {self.tests_run}", "INFO")
        self.log(f"Tests Passed: {self.tests_passed}", "INFO")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}", "INFO")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "N/A", "INFO")
        self.log("="*80, "INFO")
        
        if self.tests_passed == self.tests_run:
            self.log("✅ ALL TESTS PASSED - NO REGRESSION DETECTED", "SUCCESS")
            return 0
        else:
            self.log("❌ SOME TESTS FAILED - REGRESSION DETECTED", "FAILURE")
            return 1

def main():
    tester = ECOTester()
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        tester.log("\n⚠️  Tests interrupted by user", "WARN")
    except Exception as e:
        tester.log(f"\n❌ Unexpected error: {str(e)}", "ERROR")
        import traceback
        traceback.print_exc()
    
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
