#!/usr/bin/env python3
"""
Backend API Test Suite for Make My Propertyz
Tests all critical backend APIs including unauthenticated endpoints
"""

import requests
import json
import sys
from typing import Dict, Any
from datetime import datetime

# Configuration
BACKEND_URL = "http://127.0.0.1:8000/api"
ADMIN_EMAIL = "admin@makemypropertyz.com"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class APITester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.admin_token = None
        self.test_property_id = None
        self.test_results = []
        
    def log(self, message: str, color: str = Colors.RESET):
        print(f"{color}{message}{Colors.RESET}")
        
    def test_passed(self, test_name: str, details: str = ""):
        self.log(f"✅ PASS: {test_name} {details}", Colors.GREEN)
        self.test_results.append({"test": test_name, "status": "PASS", "details": details})
        
    def test_failed(self, test_name: str, details: str = ""):
        self.log(f"❌ FAIL: {test_name} {details}", Colors.RED)
        self.test_results.append({"test": test_name, "status": "FAIL", "details": details})
        
    def test_warning(self, test_name: str, details: str = ""):
        self.log(f"⚠️  WARN: {test_name} {details}", Colors.YELLOW)
        self.test_results.append({"test": test_name, "status": "WARN", "details": details})

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, 
                    expected_status: int = 200) -> Dict[str, Any]:
        """Make HTTP request and handle response"""
        url = f"{self.backend_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return {
                "status_code": response.status_code,
                "json": response.json() if response.headers.get('content-type', '').startswith('application/json') else None,
                "text": response.text,
                "success": response.status_code == expected_status
            }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 0,
                "json": None,
                "text": str(e),
                "success": False,
                "error": str(e)
            }

    def test_health_check(self):
        """Test basic health endpoint"""
        self.log("\n🔍 Testing Health Check...", Colors.BLUE)
        
        result = self.make_request("GET", "/health")
        if result["success"] and result["json"] and result["json"].get("status") == "healthy":
            self.test_passed("Health Check", "API is responding")
        else:
            self.test_failed("Health Check", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_seed_data(self):
        """Test seed data endpoint"""
        self.log("\n🌱 Testing Seed Data...", Colors.BLUE)
        
        result = self.make_request("GET", "/seed")
        if result["success"] and result["json"]:
            self.test_passed("Seed Data", "Data seeding completed")
        else:
            # Might already be seeded, check if admin exists by trying to login
            self.test_warning("Seed Data", "May already be seeded - will verify in login test")

    def test_authentication_register(self):
        """Test user registration"""
        self.log("\n🔐 Testing Authentication - Register...", Colors.BLUE)
        
        # Use timestamp for unique email
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "email": f"testuser{timestamp}@example.com",
            "name": f"Test User {timestamp}",
            "phone": "9876543210",
            "password": "testpass123"
        }
        
        result = self.make_request("POST", "/auth/register", test_user, expected_status=200)
        if result["success"] and result["json"] and "access_token" in result["json"]:
            self.test_passed("User Registration", f"User created: {test_user['email']}")
        else:
            self.test_failed("User Registration", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_authentication_login(self):
        """Test admin login"""
        self.log("\n🔐 Testing Authentication - Admin Login...", Colors.BLUE)
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        result = self.make_request("POST", "/auth/login", login_data, expected_status=200)
        if result["success"] and result["json"] and "access_token" in result["json"]:
            self.admin_token = result["json"]["access_token"]
            user_info = result["json"].get("user", {})
            self.test_passed("Admin Login", f"Admin logged in: {user_info.get('email')}, Role: {user_info.get('role')}")
        else:
            self.test_failed("Admin Login", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_auth_me(self):
        """Test /auth/me endpoint with admin token"""
        if not self.admin_token:
            self.test_failed("Auth Me", "No admin token available")
            return
            
        self.log("\n👤 Testing Auth Me...", Colors.BLUE)
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        result = self.make_request("GET", "/auth/me", headers=headers)
        
        if result["success"] and result["json"]:
            user = result["json"]
            if user.get("role") == "admin":
                self.test_passed("Auth Me", f"Admin user verified: {user.get('email')}")
            else:
                self.test_failed("Auth Me", f"Expected admin role, got: {user.get('role')}")
        else:
            self.test_failed("Auth Me", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_properties_list(self):
        """Test GET /api/properties"""
        self.log("\n🏠 Testing Properties List...", Colors.BLUE)
        
        result = self.make_request("GET", "/properties")
        if result["success"] and result["json"] is not None:
            properties = result["json"]
            if isinstance(properties, list) and len(properties) > 0:
                # Store first property ID for later tests
                self.test_property_id = properties[0].get("id")
                self.test_passed("Properties List", f"Retrieved {len(properties)} properties")
            else:
                self.test_warning("Properties List", "No properties found - may need to seed data")
        else:
            self.test_failed("Properties List", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_properties_featured(self):
        """Test GET /api/properties/featured"""
        self.log("\n⭐ Testing Featured Properties...", Colors.BLUE)
        
        result = self.make_request("GET", "/properties/featured")
        if result["success"] and result["json"] is not None:
            properties = result["json"]
            if isinstance(properties, list):
                featured_count = len([p for p in properties if p.get("is_featured")])
                self.test_passed("Featured Properties", f"Retrieved {len(properties)} properties, {featured_count} marked as featured")
            else:
                self.test_failed("Featured Properties", "Response is not a list")
        else:
            self.test_failed("Featured Properties", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_property_filters(self):
        """Test property filtering"""
        self.log("\n🔍 Testing Property Filters...", Colors.BLUE)
        
        # Test property_type filter
        result = self.make_request("GET", "/properties?property_type=residential")
        if result["success"]:
            properties = result["json"]
            if properties and all(p.get("property_type") == "residential" for p in properties):
                self.test_passed("Property Type Filter", f"Residential filter working: {len(properties)} properties")
            else:
                self.test_warning("Property Type Filter", "Filter may not be working correctly")
        else:
            self.test_failed("Property Type Filter", f"Status: {result['status_code']}")
            
        # Test city filter
        result = self.make_request("GET", "/properties?city=Bangalore")
        if result["success"]:
            properties = result["json"]
            if properties:
                self.test_passed("City Filter", f"City filter working: {len(properties)} properties")
            else:
                self.test_warning("City Filter", "No properties found for Bangalore")
        else:
            self.test_failed("City Filter", f"Status: {result['status_code']}")
            
        # Test bedrooms filter
        result = self.make_request("GET", "/properties?bedrooms=3")
        if result["success"]:
            properties = result["json"]
            if properties:
                self.test_passed("Bedrooms Filter", f"Bedrooms filter working: {len(properties)} properties")
            else:
                self.test_warning("Bedrooms Filter", "No 3-bedroom properties found")
        else:
            self.test_failed("Bedrooms Filter", f"Status: {result['status_code']}")

    def test_single_property(self):
        """Test GET /api/properties/{id}"""
        if not self.test_property_id:
            self.test_failed("Single Property", "No property ID available for testing")
            return
            
        self.log("\n🏠 Testing Single Property...", Colors.BLUE)
        
        result = self.make_request("GET", f"/properties/{self.test_property_id}")
        if result["success"] and result["json"]:
            prop = result["json"]
            if prop.get("id") == self.test_property_id:
                self.test_passed("Single Property", f"Property retrieved: {prop.get('title', 'N/A')}")
            else:
                self.test_failed("Single Property", "Property ID mismatch")
        else:
            self.test_failed("Single Property", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_interest_submission(self):
        """Test POST /api/properties/interest (NO AUTH REQUIRED) - CRITICAL TEST"""
        if not self.test_property_id:
            self.test_failed("Interest Submission", "No property ID available for testing")
            return
            
        self.log("\n💝 Testing Interest Submission (CRITICAL - NO AUTH)...", Colors.BLUE)
        
        # Use timestamp for unique email
        timestamp = int(datetime.now().timestamp())
        interest_data = {
            "property_id": self.test_property_id,
            "name": f"Raj Kumar {timestamp}",
            "email": f"raj.kumar{timestamp}@example.com",
            "phone": "9876543210"
        }
        
        # Test WITHOUT authentication headers
        result = self.make_request("POST", "/properties/interest", interest_data, expected_status=200)
        if result["success"] and result["json"]:
            response = result["json"]
            if "message" in response and "id" in response:
                self.test_passed("Interest Submission (No Auth)", f"Interest submitted successfully: {response['message']}")
                
                # Test duplicate submission (should fail)
                duplicate_result = self.make_request("POST", "/properties/interest", interest_data, expected_status=400)
                if duplicate_result["status_code"] == 400:
                    self.test_passed("Interest Duplicate Prevention", "Duplicate interest correctly rejected")
                else:
                    self.test_warning("Interest Duplicate Prevention", "Duplicate not prevented")
            else:
                self.test_failed("Interest Submission (No Auth)", f"Invalid response format: {response}")
        else:
            self.test_failed("Interest Submission (No Auth)", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_contact_form(self):
        """Test POST /api/contact (NO AUTH REQUIRED)"""
        self.log("\n📞 Testing Contact Form (NO AUTH)...", Colors.BLUE)
        
        timestamp = int(datetime.now().timestamp())
        contact_data = {
            "name": f"Priya Sharma {timestamp}",
            "email": f"priya.sharma{timestamp}@example.com",
            "phone": "9876543211",
            "message": f"I am interested in your property services. Contact me please. Timestamp: {timestamp}"
        }
        
        # Test WITHOUT authentication headers
        result = self.make_request("POST", "/contact", contact_data, expected_status=200)
        if result["success"] and result["json"]:
            response = result["json"]
            if "message" in response and "id" in response:
                self.test_passed("Contact Form (No Auth)", f"Contact submitted successfully: {response['message']}")
            else:
                self.test_failed("Contact Form (No Auth)", f"Invalid response format: {response}")
        else:
            self.test_failed("Contact Form (No Auth)", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_admin_stats(self):
        """Test GET /api/admin/stats (REQUIRES ADMIN AUTH)"""
        if not self.admin_token:
            self.test_failed("Admin Stats", "No admin token available")
            return
            
        self.log("\n📊 Testing Admin Stats...", Colors.BLUE)
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        result = self.make_request("GET", "/admin/stats", headers=headers)
        
        if result["success"] and result["json"]:
            stats = result["json"]
            required_fields = ["total_properties", "total_interests", "total_contacts", 
                             "unread_contacts", "residential_properties", "commercial_properties"]
            if all(field in stats for field in required_fields):
                self.test_passed("Admin Stats", f"Stats retrieved: {stats['total_properties']} properties, {stats['total_interests']} interests")
            else:
                self.test_failed("Admin Stats", f"Missing required fields in response: {stats}")
        else:
            self.test_failed("Admin Stats", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_admin_interests(self):
        """Test GET /api/admin/interests (REQUIRES ADMIN AUTH)"""
        if not self.admin_token:
            self.test_failed("Admin Interests", "No admin token available")
            return
            
        self.log("\n💝 Testing Admin Interests...", Colors.BLUE)
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        result = self.make_request("GET", "/admin/interests", headers=headers)
        
        if result["success"] and result["json"] is not None:
            interests = result["json"]
            if isinstance(interests, list):
                self.test_passed("Admin Interests", f"Retrieved {len(interests)} interests")
            else:
                self.test_failed("Admin Interests", "Response is not a list")
        else:
            self.test_failed("Admin Interests", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_admin_contacts(self):
        """Test GET /api/admin/contacts (REQUIRES ADMIN AUTH)"""
        if not self.admin_token:
            self.test_failed("Admin Contacts", "No admin token available")
            return
            
        self.log("\n📞 Testing Admin Contacts...", Colors.BLUE)
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        result = self.make_request("GET", "/admin/contacts", headers=headers)
        
        if result["success"] and result["json"] is not None:
            contacts = result["json"]
            if isinstance(contacts, list):
                self.test_passed("Admin Contacts", f"Retrieved {len(contacts)} contacts")
            else:
                self.test_failed("Admin Contacts", "Response is not a list")
        else:
            self.test_failed("Admin Contacts", f"Status: {result['status_code']}, Response: {result['text']}")

    def test_unauthenticated_admin_access(self):
        """Test that admin endpoints reject unauthenticated requests"""
        self.log("\n🔒 Testing Unauthenticated Admin Access...", Colors.BLUE)
        
        admin_endpoints = ["/admin/stats", "/admin/interests", "/admin/contacts"]
        
        for endpoint in admin_endpoints:
            result = self.make_request("GET", endpoint, expected_status=401)
            if result["status_code"] == 401:
                self.test_passed(f"Admin Security - {endpoint}", "Correctly rejected unauthenticated request")
            else:
                self.test_failed(f"Admin Security - {endpoint}", f"Expected 401, got {result['status_code']}")

    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        self.log("🚀 Starting Make My Propertyz Backend API Tests", Colors.BLUE)
        self.log(f"Backend URL: {self.backend_url}", Colors.YELLOW)
        self.log("=" * 60, Colors.BLUE)
        
        # Core tests in logical order
        self.test_health_check()
        self.test_seed_data()
        
        # Authentication tests
        self.test_authentication_register()
        self.test_authentication_login()
        self.test_auth_me()
        
        # Property tests (no auth required)
        self.test_properties_list()
        self.test_properties_featured()
        self.test_property_filters()
        self.test_single_property()
        
        # Critical unauthenticated endpoints
        self.test_interest_submission()  # CRITICAL TEST
        self.test_contact_form()
        
        # Admin authenticated tests
        self.test_admin_stats()
        self.test_admin_interests()
        self.test_admin_contacts()
        
        # Security tests
        self.test_unauthenticated_admin_access()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        self.log("\n" + "=" * 60, Colors.BLUE)
        self.log("🎯 TEST RESULTS SUMMARY", Colors.BLUE)
        self.log("=" * 60, Colors.BLUE)
        
        passed = [r for r in self.test_results if r["status"] == "PASS"]
        failed = [r for r in self.test_results if r["status"] == "FAIL"]
        warnings = [r for r in self.test_results if r["status"] == "WARN"]
        
        self.log(f"✅ PASSED: {len(passed)}", Colors.GREEN)
        self.log(f"❌ FAILED: {len(failed)}", Colors.RED)
        self.log(f"⚠️  WARNINGS: {len(warnings)}", Colors.YELLOW)
        
        if failed:
            self.log("\n❌ FAILED TESTS:", Colors.RED)
            for test in failed:
                self.log(f"  - {test['test']}: {test['details']}", Colors.RED)
        
        if warnings:
            self.log(f"\n⚠️  WARNINGS:", Colors.YELLOW)
            for test in warnings:
                self.log(f"  - {test['test']}: {test['details']}", Colors.YELLOW)
        
        # Critical test results
        critical_tests = ["Interest Submission (No Auth)", "Contact Form (No Auth)"]
        critical_results = [r for r in self.test_results if any(ct in r["test"] for ct in critical_tests)]
        
        self.log("\n🎯 CRITICAL FEATURES (No Auth Required):", Colors.BLUE)
        for test in critical_results:
            color = Colors.GREEN if test["status"] == "PASS" else Colors.RED
            self.log(f"  {test['test']}: {test['status']}", color)
        
        # Overall status
        if len(failed) == 0:
            self.log(f"\n🎉 ALL TESTS PASSED! Backend API is working correctly.", Colors.GREEN)
        else:
            self.log(f"\n⚠️  {len(failed)} tests failed. Please review the issues above.", Colors.RED)

def main():
    """Main test execution"""
    tester = APITester()
    try:
        tester.run_all_tests()
        
        # Return exit code based on critical test results
        failed_tests = [r for r in tester.test_results if r["status"] == "FAIL"]
        critical_failed = any("Interest Submission" in test["test"] or "Contact Form" in test["test"] 
                             for test in failed_tests)
        
        if critical_failed:
            sys.exit(1)  # Critical feature failed
        elif failed_tests:
            sys.exit(2)  # Non-critical tests failed
        else:
            sys.exit(0)  # All tests passed
            
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
        sys.exit(130)
    except Exception as e:
        print(f"\n{Colors.RED}Test execution failed: {str(e)}{Colors.RESET}")
        sys.exit(1)

if __name__ == "__main__":
    main()