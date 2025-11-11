#!/bin/bash
# Unix Setup Script for Web Technology Reconnaissance Tool
# Supports Linux and macOS

set -e  # Exit on error

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Web Technology - Unix Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo -e "${YELLOW}Detected OS: Linux${NC}"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo -e "${YELLOW}Detected OS: macOS${NC}"
else
    echo -e "${RED}Unsupported OS: $OSTYPE${NC}"
    exit 1
fi

# 1. Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

# 2. Check/Install pnpm
echo -e "${YELLOW}[2/5] Checking pnpm installation...${NC}"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓ pnpm is installed: $PNPM_VERSION${NC}"
else
    echo -e "${YELLOW}✗ pnpm is not installed. Installing...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm installed successfully${NC}"
fi

# 3. Install ffuf
echo -e "${YELLOW}[3/5] Installing ffuf (Directory Fuzzer)...${NC}"
if command -v ffuf &> /dev/null; then
    FFUF_VERSION=$(ffuf -V 2>&1 | head -n1 || echo "unknown")
    echo -e "${GREEN}✓ ffuf is already installed: $FFUF_VERSION${NC}"
else
    if [[ "$OS" == "linux" ]]; then
        echo -e "${CYAN}Installing ffuf via apt...${NC}"
        if command -v apt &> /dev/null; then
            sudo apt update
            sudo apt install -y ffuf
            echo -e "${GREEN}✓ ffuf installed successfully${NC}"
        else
            echo -e "${YELLOW}apt not found. Please install ffuf manually from:${NC}"
            echo -e "${GRAY}https://github.com/ffuf/ffuf/releases${NC}"
        fi
    elif [[ "$OS" == "macos" ]]; then
        echo -e "${CYAN}Installing ffuf via Homebrew...${NC}"
        if command -v brew &> /dev/null; then
            brew install ffuf
            echo -e "${GREEN}✓ ffuf installed successfully${NC}"
        else
            echo -e "${YELLOW}Homebrew not found. Please install from:${NC}"
            echo -e "${GRAY}https://brew.sh${NC}"
        fi
    fi
fi

# 4. Clone SecLists
echo -e "${YELLOW}[4/5] Installing SecLists wordlists...${NC}"
if [[ "$OS" == "linux" ]]; then
    SECLISTS_DIR="/opt/SecLists"
    if [ -d "$SECLISTS_DIR" ]; then
        echo -e "${GREEN}✓ SecLists is already installed at $SECLISTS_DIR${NC}"
    else
        echo -e "${CYAN}Cloning SecLists to $SECLISTS_DIR (requires sudo)...${NC}"
        sudo git clone --depth 1 https://github.com/danielmiessler/SecLists.git $SECLISTS_DIR
        echo -e "${GREEN}✓ SecLists installed successfully${NC}"
    fi
elif [[ "$OS" == "macos" ]]; then
    SECLISTS_DIR="$HOME/SecLists"
    if [ -d "$SECLISTS_DIR" ]; then
        echo -e "${GREEN}✓ SecLists is already installed at $SECLISTS_DIR${NC}"
    else
        echo -e "${CYAN}Cloning SecLists to $SECLISTS_DIR...${NC}"
        git clone --depth 1 https://github.com/danielmiessler/SecLists.git $SECLISTS_DIR
        echo -e "${GREEN}✓ SecLists installed successfully${NC}"
    fi
fi

# 5. Install project dependencies
echo -e "${YELLOW}[5/5] Installing project dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed successfully${NC}"

# Summary
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${NC}1. Configure your database connection in .env file${NC}"
echo -e "${NC}2. Run 'pnpm db:push' to setup the database${NC}"
echo -e "${NC}3. (Optional) Add your API keys in .env:${NC}"
echo -e "${GRAY}   - SHODAN_API_KEY${NC}"
echo -e "${GRAY}   - SECURITYTRAILS_API_KEY${NC}"
echo -e "${NC}4. Run 'pnpm dev' to start the development server${NC}"
echo ""
echo -e "${YELLOW}Installed tools:${NC}"
if command -v ffuf &> /dev/null; then
    echo -e "${GREEN}  ✓ ffuf: $(which ffuf)${NC}"
fi
if [[ -d "$SECLISTS_DIR" ]]; then
    echo -e "${GREEN}  ✓ SecLists: $SECLISTS_DIR${NC}"
fi
echo ""
echo -e "${CYAN}Happy hacking! 🚀${NC}"
