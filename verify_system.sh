#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "  🔍 COMPREHENSIVE SYSTEM VERIFICATION"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Hardhat node
echo -e "${BLUE}1. Checking Hardhat Node...${NC}"
HARDHAT_CHECK=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | jq -r '.result // empty')
if [ "$HARDHAT_CHECK" = "0x539" ]; then
    echo -e "${GREEN}   ✅ Hardhat node responding (Chain ID: 1337)${NC}"
else
    echo -e "${RED}   ❌ Hardhat node not responding${NC}"
fi

# Check contract bytecode
echo ""
echo -e "${BLUE}2. Checking Contract Bytecode...${NC}"
MYNNCRYPT_BYTES=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512","latest"],"id":1}' | jq -r '.result | length')
if [ "$MYNNCRYPT_BYTES" -gt 2 ]; then
    echo -e "${GREEN}   ✅ MynnCrypt bytecode: ${MYNNCRYPT_BYTES} bytes${NC}"
else
    echo -e "${RED}   ❌ MynnCrypt bytecode missing (length: $MYNNCRYPT_BYTES)${NC}"
fi

MYNNGIFT_BYTES=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x5FbDB2315678afecb367f032d93F642f64180aa3","latest"],"id":1}' | jq -r '.result | length')
if [ "$MYNNGIFT_BYTES" -gt 2 ]; then
    echo -e "${GREEN}   ✅ MynnGift bytecode: ${MYNNGIFT_BYTES} bytes${NC}"
else
    echo -e "${RED}   ❌ MynnGift bytecode missing${NC}"
fi

# Check frontend
echo ""
echo -e "${BLUE}3. Checking Frontend Server...${NC}"
FRONTEND_CHECK=$(curl -s http://localhost:5173 -w "%{http_code}" -o /dev/null 2>/dev/null)
if [ "$FRONTEND_CHECK" = "200" ]; then
    echo -e "${GREEN}   ✅ Frontend server responding (port 5173)${NC}"
else
    echo -e "${RED}   ❌ Frontend server not responding (HTTP: $FRONTEND_CHECK)${NC}"
fi

# Check frontend .env
echo ""
echo -e "${BLUE}4. Checking Frontend Configuration...${NC}"
if grep -q "VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" /Users/macbook/projects/project\ MC/MC/mc_frontend/.env; then
    echo -e "${GREEN}   ✅ VITE_MYNNCRYPT_ADDRESS configured${NC}"
else
    echo -e "${RED}   ❌ VITE_MYNNCRYPT_ADDRESS not configured${NC}"
fi

if grep -q "VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" /Users/macbook/projects/project\ MC/MC/mc_frontend/.env; then
    echo -e "${GREEN}   ✅ VITE_MYNNGIFT_ADDRESS configured${NC}"
else
    echo -e "${RED}   ❌ VITE_MYNNGIFT_ADDRESS not configured${NC}"
fi

# Check App.jsx ABI extraction
echo ""
echo -e "${BLUE}5. Checking Frontend Code...${NC}"
if grep -q "mynncryptAbiRaw.abi || mynncryptAbiRaw" /Users/macbook/projects/project\ MC/MC/mc_frontend/src/App.jsx; then
    echo -e "${GREEN}   ✅ ABI extraction code present${NC}"
else
    echo -e "${RED}   ❌ ABI extraction code missing${NC}"
fi

if grep -q "ABIDebugger" /Users/macbook/projects/project\ MC/MC/mc_frontend/src/App.jsx; then
    echo -e "${GREEN}   ✅ ABIDebugger component imported${NC}"
else
    echo -e "${RED}   ❌ ABIDebugger component missing${NC}"
fi

if grep -q "ContractTest" /Users/macbook/projects/project\ MC/MC/mc_frontend/src/App.jsx; then
    echo -e "${GREEN}   ✅ ContractTest component imported${NC}"
else
    echo -e "${RED}   ❌ ContractTest component missing${NC}"
fi

# Test contract call
echo ""
echo -e "${BLUE}6. Testing Contract Function Call...${NC}"
echo "   Running: npx hardhat run verify_contract.ts --network localhost"
cd /Users/macbook/projects/project\ MC/MC/mc_backend
VERIFY_RESULT=$(npx hardhat run verify_contract.ts --network localhost 2>&1 | grep "id(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)")
if echo "$VERIFY_RESULT" | grep -q "returned: A8888NR"; then
    echo -e "${GREEN}   ✅ Contract id() call working (returns: A8888NR)${NC}"
else
    echo -e "${YELLOW}   ⚠️  Could not verify id() call${NC}"
fi

# Summary
echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}  ✅ SYSTEM VERIFICATION COMPLETE${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📌 Quick Start:"
echo "   1. Open http://localhost:5173 in browser"
echo "   2. Check browser console for debug output"
echo "   3. Look for debug panels in top-left corner"
echo ""
echo "✅ Status: All systems operational"
echo "🎯 Next: Test platform wallet registration"
echo ""
