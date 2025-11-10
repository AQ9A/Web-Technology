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


## Shodan Integration Enhancement
- [x] Add SHODAN_API_KEY to environment variables
- [x] Update port scanning to use Shodan data when available
- [x] Prioritize Shodan results over direct TCP scanning for Cloudflare-protected sites
- [ ] Display Shodan-detected ports separately or with indicator
- [ ] Add organization/ISP info from Shodan to results page


## Critical Bug - Port Scanning Still Shows All Ports
- [ ] Debug why Shodan API is not being called properly
- [ ] Check Shodan API key validity
- [ ] Add detailed logging to see if Shodan returns data
- [ ] Fix port scanning to show only real open ports
- [ ] Test with ksa.com to verify accurate results


## Major Redesign - Web Technology
- [x] Change project name to "Web Technology"
- [x] Remove all Vulnerabilities features from backend
- [x] Remove Vulnerabilities tab from frontend
- [ ] Update database schema (remove vulnerabilities table)
- [x] Design new modern color scheme (Cyan/Blue theme)
- [x] Add smooth animations and transitions
- [ ] Add interactive dashboard with statistics
- [ ] Add PDF export functionality
- [ ] Add scan comparison feature
- [ ] Add interactive charts for data visualization
- [x] Improve icons and graphics
- [ ] Add skeleton loading states
- [x] Enhance responsive design
- [x] Update logo and branding


## UI/UX Enhancements
- [ ] Update app title to "Web Technology" in Settings (requires manual update in Management UI)
- [x] Redesign Home page with better visual hierarchy
- [x] Add animated background effects
- [x] Improve card designs with glassmorphism
- [x] Add hover effects and micro-interactions
- [x] Enhance typography and spacing
- [ ] Add loading skeletons for better UX


## Update App Name
- [ ] Change APP_TITLE in const.ts to "Web Technology"
- [ ] Update all references to app name in code


## C99.nl Subdomain Finder Integration
- [x] Add c99.nl subdomain scraping functionality
- [x] Parse HTML results from c99.nl
- [x] Merge c99.nl subdomains with existing results
- [x] Remove duplicates and sort subdomains
- [x] Display combined results in subdomain section


## Critical Bugs to Fix
- [ ] Fix WHOIS display - not showing results in UI (needs testing)
- [x] Replace c99 with crt.sh API (c99 requires JavaScript rendering)
- [x] Add crt.sh Certificate Transparency subdomain discovery
- [ ] Test subdomain discovery with multiple sources


## New Features - Data Source Badges & Wayback Machine
- [x] Add source tracking to subdomain discovery (DNS/SecurityTrails/crt.sh)
- [x] Update database schema to store subdomain source
- [x] Display source badges in subdomain results UI
- [x] Integrate Wayback Machine API
- [x] Fetch historical snapshots from Internet Archive
- [x] Display Wayback Machine results in new Wayback tab
- [x] Show timeline of archived versions with View Archive buttons
