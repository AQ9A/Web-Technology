# Project TODO - Recon & Pentest Tool

## المرحلة 1: قاعدة البيانات
- [x] إنشاء جدول scans لحفظ عمليات الفحص
- [x] إنشاء جدول subdomains لحفظ النطاقات الفرعية
- [x] إنشاء جدول ports لحفظ المنافذ المفتوحة
- [x] إنشاء جدول technologies لحفظ التقنيات المكتشفة
- [x] إنشاء جدول vulnerabilities لحفظ الثغرات المحتملة

## المرحلة 2: الواجهة الخلفية (Backend)
- [x] تطوير API لجلب معلومات WHOIS
- [x] تطوير API لاكتشاف النطاقات الفرعية (Subdomain Enumeration)
- [x] تطوير API لفحص المنافذ (Port Scanning)
- [x] تطوير API لاكتشاف التقنيات المستخدمة (Technology Detection)
- [x] تطوير API لفحص DNS Records
- [x] تطوير API لفحص SSL/TLS Certificate
- [x] تطوير API لاكتشاف الثغرات الشائعة
- [x] تطوير API لحفظ واسترجاع نتائج الفحص

## المرحلة 3: الواجهة الأمامية (Frontend)
- [x] تصميم صفحة رئيسية بواجهة احترافية (Cybersecurity Theme)
- [x] إنشاء نموذج إدخال النطاق (Domain Input)
- [x] عرض حالة الفحص (Scanning Progress)
- [x] عرض نتائج WHOIS
- [x] عرض النطاقات الفرعية المكتشفة
- [x] عرض المنافذ المفتوحة
- [x] عرض التقنيات المكتشفة
- [x] عرض DNS Records
- [x] عرض معلومات SSL Certificate
- [x] عرض الثغرات المحتملة
- [x] إضافة ميزة تصدير النتائج (Export Results)
- [x] إضافة ميزة عرض سجل الفحوصات السابقة

## المرحلة 4: الاختبار والنشر
- [x] اختبار جميع APIs
- [x] اختبار واجهة المستخدم
- [x] حفظ نقطة استعادة (Checkpoint)

## Language Requirement
- [x] Ensure all UI text is in English
- [x] Update all labels, buttons, and messages to English


## Bug Fixes
- [x] Fix scan failure issue for testphp.vulnweb.com
- [x] Add better error handling and logging
- [x] Improve scan reliability


## SecurityTrails API Integration
- [x] Request SecurityTrails API key from user
- [x] Create SecurityTrails service module
- [x] Fetch historical DNS records
- [x] Fetch historical WHOIS data
- [x] Fetch subdomain history
- [x] Display historical data in UI
- [x] Add historical data to database schema


## New Features & Improvements
- [x] Add delete scan functionality
- [x] Add delete button to scan results page
- [x] Add delete button to scan history page
- [x] Fix port scanning to be accurate and real (no fake data)
- [x] Implement proper TCP connection testing for ports
- [x] Remove mock/fake port data


## Critical Bug Fix
- [x] Fix port scanning - currently scanning localhost instead of target domain
- [x] Ensure port scan uses the actual target IP address from DNS lookup
- [x] Add logging to verify correct IP is being scanned
- [x] Add clarification in UI that only real open ports are shown

Note: testphp.vulnweb.com is a deliberately vulnerable test site that has many ports open by design for security testing purposes.


## Critical Fixes & New Features
- [x] FIX: Port scanning is scanning localhost instead of target domain
- [x] Debug and fix DNS resolution in port scanning
- [x] Add banner grabbing for service version detection
- [x] Add Shodan API integration (optional with API key)
- [x] Improve vulnerability checks to be more accurate
- [ ] Test with real domains (google.com, github.com) to verify accuracy
