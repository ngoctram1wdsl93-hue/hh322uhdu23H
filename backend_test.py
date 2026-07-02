#!/usr/bin/env python3
"""
Backend API tests for ECO.NOVA design/content improvements:
- Expanded legal documents (Terms 22 sections, Privacy 18 sections, Cookies 11 sections)
- Site-info API with copyright text
- Favicon assets
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://admin-logic-test-5.preview.emergentagent.com"

class TestRunner:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.token = None

    def log(self, msg):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    def test(self, name, method, endpoint, expected_status, data=None, headers=None, check_fn=None):
        """Run a single API test with optional custom check function"""
        url = f"{BASE_URL}{endpoint}"
        h = headers or {}
        if self.token and 'Authorization' not in h:
            h['Authorization'] = f'Bearer {self.token}'
        if 'Content-Type' not in h and data:
            h['Content-Type'] = 'application/json'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=h, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=h, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=h, timeout=15)
            else:
                self.log(f"❌ Unsupported method: {method}")
                return False, {}

            success = response.status_code == expected_status
            
            # Run custom check if provided
            if success and check_fn:
                try:
                    json_data = response.json() if response.text else {}
                    check_result = check_fn(json_data, response)
                    if not check_result:
                        success = False
                        self.log(f"❌ Custom check failed")
                except Exception as e:
                    success = False
                    self.log(f"❌ Custom check error: {str(e)}")
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ Passed - Status: {response.status_code}")
            else:
                self.log(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.status_code != expected_status:
                    self.log(f"   Response: {response.text[:300]}")

            try:
                return success, response.json()
            except:
                return success, {}

        except Exception as e:
            self.log(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_policy_content_length(self):
        """Test that expanded legal documents have sufficient content"""
        self.log("\n=== LEGAL DOCUMENT CONTENT LENGTH ===")
        
        tests = [
            ("terms", "uk", 12000, "Terms (UK) should have > 12000 chars"),
            ("cookies", "en", 7000, "Cookies (EN) should have > 7000 chars"),
            ("privacy", "uk", 8500, "Privacy (UK) should have > 8500 chars"),
        ]
        
        all_passed = True
        for key, lang, min_length, description in tests:
            def check_length(data, resp):
                content = data.get('content', '')
                actual_len = len(content)
                self.log(f"   {key} ({lang}): {actual_len} chars (min: {min_length})")
                if actual_len < min_length:
                    self.log(f"   ⚠️  Content too short!")
                    return False
                return True
            
            success, _ = self.test(
                f"{description}",
                "GET",
                f"/api/site-info/policy/{key}?lang={lang}",
                200,
                check_fn=check_length
            )
            if not success:
                all_passed = False
        
        return all_passed

    def test_policy_specific_sections(self):
        """Test that legal documents contain specific sections"""
        self.log("\n=== LEGAL DOCUMENT SPECIFIC SECTIONS ===")
        
        all_passed = True
        
        # Terms should have section 22 (Contact / Контакти)
        def check_terms_section_22(data, resp):
            content = data.get('content', '')
            has_contact_uk = '22. Контакти' in content
            has_contact_en = '22. Contact' in content
            self.log(f"   Terms has '22. Контакти': {has_contact_uk}")
            self.log(f"   Terms has '22. Contact': {has_contact_en}")
            return has_contact_uk or has_contact_en
        
        success, _ = self.test(
            "Terms has section '22. Contact'/'22. Контакти'",
            "GET",
            "/api/site-info/policy/terms?lang=uk",
            200,
            check_fn=check_terms_section_22
        )
        if not success:
            all_passed = False
        
        # Cookies should have 'Do Not Track' section
        def check_cookies_dnt(data, resp):
            content = data.get('content', '')
            has_dnt = 'Do Not Track' in content or 'Do Not Track' in content
            self.log(f"   Cookies has 'Do Not Track' section: {has_dnt}")
            return has_dnt
        
        success, _ = self.test(
            "Cookies has 'Do Not Track' section",
            "GET",
            "/api/site-info/policy/cookies?lang=en",
            200,
            check_fn=check_cookies_dnt
        )
        if not success:
            all_passed = False
        
        # Privacy should have CCTV section
        def check_privacy_cctv(data, resp):
            content = data.get('content', '')
            has_cctv = 'CCTV' in content or 'відеоспостереження' in content.lower()
            self.log(f"   Privacy has CCTV section: {has_cctv}")
            return has_cctv
        
        success, _ = self.test(
            "Privacy has CCTV section",
            "GET",
            "/api/site-info/policy/privacy?lang=uk",
            200,
            check_fn=check_privacy_cctv
        )
        if not success:
            all_passed = False
        
        return all_passed

    def test_site_info_copyright(self):
        """Test that site-info contains proper copyright text"""
        self.log("\n=== SITE INFO COPYRIGHT TEXT ===")
        
        def check_copyright(data, resp):
            footer = data.get('footer', {})
            copyright_text = footer.get('copyright', '')
            
            # Check for domain-specific copyright
            has_hazardous = 'hazardous waste' in copyright_text.lower() or 'небезпечних відходів' in copyright_text.lower()
            has_utilization = 'utilization' in copyright_text.lower() or 'утилізація' in copyright_text.lower()
            
            self.log(f"   Copyright text: {copyright_text[:100]}...")
            self.log(f"   Contains hazardous waste reference: {has_hazardous}")
            self.log(f"   Contains utilization reference: {has_utilization}")
            
            return has_hazardous or has_utilization
        
        success, _ = self.test(
            "Site-info has domain-specific copyright",
            "GET",
            "/api/site-info",
            200,
            check_fn=check_copyright
        )
        
        return success

    def test_favicon_assets(self):
        """Test that favicon assets are served correctly"""
        self.log("\n=== FAVICON ASSETS ===")
        
        assets = [
            "/favicon.svg",
            "/favicon.ico",
            "/favicon-32x32.png",
            "/favicon-16x16.png",
            "/apple-touch-icon.png",
            "/android-chrome-192x192.png",
        ]
        
        all_passed = True
        for asset in assets:
            try:
                url = f"{BASE_URL}{asset}"
                response = requests.get(url, timeout=10)
                success = response.status_code == 200
                
                self.tests_run += 1
                if success:
                    self.tests_passed += 1
                    self.log(f"✅ {asset} - Status: 200, Size: {len(response.content)} bytes")
                else:
                    self.log(f"❌ {asset} - Status: {response.status_code}")
                    all_passed = False
            except Exception as e:
                self.tests_run += 1
                self.log(f"❌ {asset} - Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_index_html_cache_version(self):
        """Test that index.html references ?v=eco4 for favicon cache busting"""
        self.log("\n=== INDEX.HTML CACHE VERSION ===")
        
        try:
            url = f"{BASE_URL}/"
            response = requests.get(url, timeout=10)
            
            self.tests_run += 1
            if response.status_code == 200:
                html_content = response.text
                has_cache_version = '?v=eco4' in html_content
                
                if has_cache_version:
                    self.tests_passed += 1
                    self.log(f"✅ index.html references ?v=eco4 for cache busting")
                    return True
                else:
                    self.log(f"❌ index.html does NOT reference ?v=eco4")
                    return False
            else:
                self.log(f"❌ Failed to fetch index.html - Status: {response.status_code}")
                return False
        except Exception as e:
            self.tests_run += 1
            self.log(f"❌ Error fetching index.html: {str(e)}")
            return False

    def run_all(self):
        """Run all tests"""
        self.log("=" * 70)
        self.log("ECO.NOVA Backend API Tests - Design/Content Improvements")
        self.log("=" * 70)

        # Test expanded legal documents
        self.test_policy_content_length()
        self.test_policy_specific_sections()
        
        # Test site-info copyright
        self.test_site_info_copyright()
        
        # Test favicon assets
        self.test_favicon_assets()
        
        # Test index.html cache version
        self.test_index_html_cache_version()

        # Summary
        self.log("\n" + "=" * 70)
        self.log(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        self.log("=" * 70)
        
        return 0 if self.tests_passed == self.tests_run else 1

if __name__ == "__main__":
    runner = TestRunner()
    sys.exit(runner.run_all())
