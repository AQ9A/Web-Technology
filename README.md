# 🔍 Web Technology Reconnaissance Tool

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)

**Professional OSINT & Reconnaissance Platform for Security Researchers**

Comprehensive domain intelligence gathering tool with advanced subdomain enumeration, port scanning, technology detection, and historical data analysis.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Keys](#-api-keys-configuration) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Linux](#linux-ubuntu--debian)
  - [Windows](#windows)
  - [macOS](#macos)
- [Configuration](#-configuration)
- [API Keys](#-api-keys-configuration)
- [Usage](#-usage)
- [Database Setup](#-database-setup)
- [Deployment](#-deployment)
- [Security Considerations](#-security-considerations)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Web Technology Reconnaissance Tool** is a full-stack web application designed for penetration testers, security researchers, and bug bounty hunters. It automates the reconnaissance phase of security assessments by gathering comprehensive intelligence about target domains.

### Key Capabilities

- **Subdomain Enumeration**: Discover subdomains using DNS queries, SecurityTrails API, and Certificate Transparency logs (crt.sh)
- **Port Scanning**: Identify open ports and services using Shodan integration and direct TCP scanning
- **Technology Detection**: Detect web technologies, frameworks, CMS, CDNs, and server software with version information
- **SSL/TLS Analysis**: Analyze SSL certificates, validity, issuers, and encryption details
- **Historical Data**: Track domain changes over time with DNS history, WHOIS history, and IP history
- **Wayback Machine**: Access archived versions of websites from Internet Archive
- **Real-time Monitoring**: Live scan progress tracking with detailed status updates

---

## ✨ Features

### 🔎 **Reconnaissance Capabilities**

| Feature | Description |
|---------|-------------|
| **Subdomain Discovery** | Multi-source enumeration (DNS, SecurityTrails, crt.sh) with source badges |
| **Port Scanning** | Shodan-powered and direct TCP scanning for accurate port detection |
| **Technology Stack Detection** | Identify 50+ technologies including WordPress, React, Angular, Cloudflare, etc. |
| **WHOIS Lookup** | Domain registration details, registrar, creation/expiration dates |
| **DNS Records** | Complete DNS record analysis (A, AAAA, MX, NS, TXT, CNAME) |
| **SSL/TLS Certificates** | Certificate details, validity period, issuer, encryption algorithms |
| **Banner Grabbing** | Service version detection from open ports |
| **Historical Analysis** | DNS history, WHOIS history, IP address changes over time |
| **Wayback Machine** | Access up to 50 historical snapshots from Internet Archive |

### 🎨 **User Interface**

- **Modern Dark Theme**: Professional cybersecurity-themed UI with cyan accents
- **Real-time Progress**: Live scan status with percentage completion
- **Tabbed Results**: Organized data presentation across 8 different tabs
- **Technology Icons**: Visual representation of detected technologies with emoji icons
- **Source Badges**: Color-coded badges showing data sources (DNS, SecurityTrails, crt.sh)
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS 4

### 🔐 **Security & Privacy**

- **User Authentication**: Secure OAuth-based login system
- **API Key Management**: Users provide their own API keys (no shared credentials)
- **API Key Validation**: Test API keys before saving with detailed feedback
- **Data Isolation**: Each user's scan data is completely isolated
- **Secure Storage**: API keys encrypted in database
- **Rate Limit Handling**: Intelligent error messages for API quota limits

### 📊 **Data Management**

- **Scan History**: View all previous reconnaissance scans
- **Delete Scans**: Remove unwanted scan results
- **Export Ready**: Structured data ready for JSON/CSV export (future feature)
- **Database Persistence**: All scan results stored in MySQL/TiDB

---

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript 5.9** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **tRPC 11** - End-to-end type-safe APIs
- **Wouter** - Lightweight routing
- **Shadcn/ui** - Beautiful component library
- **Lucide Icons** - Modern icon set

### Backend
- **Node.js 18+** - Runtime environment
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **Axios** - HTTP client
- **Cheerio** - HTML parsing
- **Wappalyzer** - Technology detection

### APIs & Services
- **Shodan API** - Port scanning and service detection
- **SecurityTrails API** - Subdomain enumeration and DNS history
- **crt.sh** - Certificate Transparency logs
- **Wayback Machine API** - Historical website snapshots

---

## 📦 Prerequisites

Before installation, ensure you have:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 (Install: `npm install -g pnpm`)
- **MySQL** >= 8.0 or **TiDB** (Cloud database recommended)
- **Git** (for cloning repository)

### API Keys (Optional but Recommended)

- **Shodan API Key**: [Get Free Key](https://account.shodan.io/) (Free plan: 100 scans/month)
- **SecurityTrails API Key**: [Get Free Key](https://securitytrails.com/app/account/credentials) (Free plan: 50 calls/month)

> **Note**: The tool works without API keys but with limited functionality. For full features, obtain free API keys from the providers above.

---

## 🚀 Installation

### Linux (Ubuntu / Debian)

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+ (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install pnpm
npm install -g pnpm

# 4. Install MySQL (if not using cloud database)
sudo apt install -y mysql-server
sudo mysql_secure_installation

# 5. Clone the repository
git clone https://github.com/AQ9A/Web-Technology.git
cd Web-Technology

# 6. Install dependencies
pnpm install

# 7. Configure environment variables
cp .env.example .env
nano .env  # Edit with your database credentials

# 8. Setup database
pnpm db:push

# 9. Start development server
pnpm dev
```

### Windows

```powershell
# 1. Install Node.js 18+ from https://nodejs.org/

# 2. Install pnpm (in PowerShell as Administrator)
npm install -g pnpm

# 3. Install MySQL from https://dev.mysql.com/downloads/installer/
#    OR use a cloud database (TiDB, PlanetScale, etc.)

# 4. Clone the repository
git clone https://github.com/AQ9A/Web-Technology.git
cd Web-Technology

# 5. Install dependencies
pnpm install

# 6. Configure environment variables
copy .env.example .env
notepad .env  # Edit with your database credentials

# 7. Setup database
pnpm db:push

# 8. Start development server
pnpm dev
```

### macOS

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js 18+
brew install node@18

# 3. Install pnpm
npm install -g pnpm

# 4. Install MySQL (or use cloud database)
brew install mysql
brew services start mysql

# 5. Clone the repository
git clone https://github.com/AQ9A/Web-Technology.git
cd Web-Technology

# 6. Install dependencies
pnpm install

# 7. Configure environment variables
cp .env.example .env
nano .env  # Edit with your database credentials

# 8. Setup database
pnpm db:push

# 9. Start development server
pnpm dev
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/pentest_recon"

# Application Configuration
VITE_APP_TITLE="Web Technology"
VITE_APP_LOGO="https://api.dicebear.com/7.x/shapes/svg?seed=WebTech&backgroundColor=10b981"

# OAuth Configuration (Manus Platform)
VITE_APP_ID="your_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
JWT_SECRET="your_jwt_secret_key_here"

# Owner Information
OWNER_OPEN_ID="your_owner_open_id"
OWNER_NAME="Your Name"

# API Keys (Optional - Users can provide their own via UI)
SHODAN_API_KEY=""
SECURITYTRAILS_API_KEY=""
```

### Database Setup

The project uses Drizzle ORM for database management. To set up the database:

```bash
# Generate and run migrations
pnpm db:push

# This will create the following tables:
# - users (authentication)
# - scans (scan operations)
# - subdomains (discovered subdomains)
# - ports (open ports)
# - technologies (detected technologies)
# - dnsRecords (DNS records)
# - whoisInfo (WHOIS data)
# - sslCertificates (SSL/TLS certificates)
# - historicalDns (DNS history)
# - historicalWhois (WHOIS history)
# - historicalIps (IP address history)
# - waybackSnapshots (Wayback Machine snapshots)
# - userApiKeys (user API keys)
```

---

## 🔑 API Keys Configuration

### Option 1: User-Provided Keys (Recommended)

1. Sign up and log in to the application
2. Navigate to the **API Keys Configuration** section on the home page
3. Enter your Shodan API key and SecurityTrails API key
4. Click **"Test API Keys"** to validate them
5. Click **"Save API Keys"** to store them securely

### Option 2: Environment Variables

Add your API keys to the `.env` file:

```env
SHODAN_API_KEY="your_shodan_api_key_here"
SECURITYTRAILS_API_KEY="your_securitytrails_api_key_here"
```

### Getting API Keys

#### Shodan API Key
1. Visit [https://account.shodan.io/](https://account.shodan.io/)
2. Sign up for a free account
3. Navigate to "My Account" → "API Key"
4. Copy your API key
5. **Free Plan**: 100 scan credits/month

#### SecurityTrails API Key
1. Visit [https://securitytrails.com/](https://securitytrails.com/)
2. Sign up for a free account
3. Navigate to "Account" → "API Credentials"
4. Generate a new API key
5. **Free Plan**: 50 API calls/month

---

## 📖 Usage

### Starting the Application

```bash
# Development mode (with hot reload)
pnpm dev

# Production build
pnpm build
pnpm start
```

The application will be available at `http://localhost:3000`

### Performing a Scan

1. **Login**: Click "Sign In to Start Scanning" and authenticate
2. **Configure API Keys**: (Optional) Add your Shodan and SecurityTrails API keys
3. **Enter Target Domain**: Input the domain you want to scan (e.g., `example.com`)
4. **Start Scan**: Click "Start Reconnaissance"
5. **Monitor Progress**: Watch real-time progress updates
6. **View Results**: Explore results across 8 different tabs:
   - **Overview**: Summary of findings
   - **Subdomains**: Discovered subdomains with source badges
   - **Ports**: Open ports and services
   - **Technologies**: Detected technologies with versions
   - **DNS**: DNS records (A, MX, NS, TXT, etc.)
   - **SSL/TLS**: Certificate details and validity
   - **Historical**: DNS/WHOIS/IP history
   - **Wayback**: Internet Archive snapshots

### Scan History

- View all previous scans from the **"Scan History"** page
- Click on any scan to view detailed results
- Delete unwanted scans using the **"Delete Scan"** button

---

## 🗄️ Database Setup

### Using MySQL Locally

```bash
# Install MySQL
sudo apt install mysql-server  # Linux
brew install mysql             # macOS

# Start MySQL service
sudo systemctl start mysql     # Linux
brew services start mysql      # macOS

# Create database
mysql -u root -p
CREATE DATABASE pentest_recon;
CREATE USER 'pentest_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON pentest_recon.* TO 'pentest_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update .env file
DATABASE_URL="mysql://pentest_user:secure_password@localhost:3306/pentest_recon"
```

### Using Cloud Database (Recommended)

**TiDB Cloud** (Free tier available):
1. Sign up at [https://tidbcloud.com/](https://tidbcloud.com/)
2. Create a new cluster
3. Get connection string
4. Update `DATABASE_URL` in `.env`

**PlanetScale** (Free tier available):
1. Sign up at [https://planetscale.com/](https://planetscale.com/)
2. Create a new database
3. Get connection string
4. Update `DATABASE_URL` in `.env`

---

## 🌐 Deployment

### Deploy to Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Deploy to Manus Platform

The application is designed to work seamlessly with the Manus Platform:

1. Create a checkpoint using the built-in tools
2. Click **"Publish"** in the management dashboard
3. Your application will be deployed with automatic SSL and CDN

### Deploy to Other Platforms

- **Vercel**: Connect your GitHub repository
- **Railway**: One-click deploy with database
- **Render**: Deploy with automatic HTTPS
- **DigitalOcean**: Deploy on App Platform

---

## 🔒 Security Considerations

### Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong database passwords** (minimum 16 characters)
3. **Rotate API keys regularly** (every 90 days recommended)
4. **Enable HTTPS** in production (use Let's Encrypt)
5. **Implement rate limiting** to prevent abuse
6. **Sanitize user inputs** (already implemented in the codebase)
7. **Keep dependencies updated** (`pnpm update`)

### Legal & Ethical Considerations

⚠️ **IMPORTANT**: This tool is designed for **authorized security testing only**.

- **Only scan domains you own or have explicit permission to test**
- **Respect robots.txt and rate limits**
- **Comply with local laws and regulations**
- **Do not use for malicious purposes**
- **Bug bounty programs**: Follow program rules and scope

**Disclaimer**: The developers are not responsible for misuse of this tool. Use responsibly and ethically.

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check if MySQL is running
sudo systemctl status mysql  # Linux
brew services list           # macOS

# Verify DATABASE_URL in .env
# Ensure credentials are correct
```

#### 2. Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9  # Linux/macOS
netstat -ano | findstr :3000   # Windows (find PID and kill)
```

#### 3. API Key Validation Fails

- **HTTP 401/403**: Invalid API key - verify key is correct
- **HTTP 429**: Rate limit exceeded - wait or upgrade plan
- **Connection failed**: Check internet connection

#### 4. Subdomain Enumeration Returns No Results

- Ensure API keys are configured
- Check API quota limits
- Some domains may have no subdomains

#### 5. TypeScript Compilation Errors

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Web Technology Reconnaissance Tool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Shodan** - Internet-wide port scanning database
- **SecurityTrails** - DNS and subdomain intelligence
- **crt.sh** - Certificate Transparency log search
- **Wayback Machine** - Internet Archive historical snapshots
- **Wappalyzer** - Technology detection library
- **Shadcn/ui** - Beautiful UI components
- **Manus Platform** - Hosting and deployment infrastructure

---

## 📞 Support

For issues, questions, or feature requests:

- **GitHub Issues**: [https://github.com/AQ9A/Web-Technology/issues](https://github.com/AQ9A/Web-Technology/issues)
- **Discussions**: [https://github.com/AQ9A/Web-Technology/discussions](https://github.com/AQ9A/Web-Technology/discussions)

---

<div align="center">

**Made with ❤️ for the Security Research Community**

⭐ Star this repository if you find it useful!

[Report Bug](https://github.com/AQ9A/Web-Technology/issues) • [Request Feature](https://github.com/AQ9A/Web-Technology/issues) • [Documentation](https://github.com/AQ9A/Web-Technology/wiki)

</div>
