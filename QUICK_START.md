# Quonkboard Quick Start Guide

## ⚡ Quick Start (30 seconds)

```bash
# Method 1: Using the startup script
/home/wilsonh/Documents/GitHub/quonkboard/START_QUONKBOARD.sh

# OR Method 2: Manual start
cd /home/wilsonh/Documents/GitHub/quonkboard
npm start
```

**Then open your browser to:** `http://localhost:3000`

---

## 🎯 First Time Connection Steps

1. **Start Quonkboard** (use command above)
2. **Open browser** to http://localhost:3000
3. **Select Engine Configuration** (Proxima, Sphinx, or Prometheus)
4. **Enter Labjack IP:Port** 
   - Default: `192.168.0.100:2707`
5. **Click Connect**
6. **Monitor Dashboard**
   - View live sensor data
   - Control valves
   - Monitor ignition system

---

## ⌨️ Keyboard Shortcuts

| Action | Command |
|--------|---------|
| Stop server | `Ctrl + C` (in terminal) |
| Open dev tools | `F12` or `Ctrl + Shift + I` |
| Refresh page | `F5` or `Ctrl + R` |
| Hard refresh | `Ctrl + Shift + R` |

---

## 📋 Verification Checklist

- ✅ Node.js installed: `/usr/bin/node`
- ✅ npm installed: `/usr/bin/npm`
- ✅ Dependencies installed: 1592 packages
- ✅ Development server ready
- ✅ Project compiled successfully
- ✅ Startup script created
- ✅ Usage guide available

---

## 🚨 Common Issues & Quick Fixes

**Issue:** Port 3000 already in use
```bash
pkill -f "npm start"
pkill -f "node"
```

**Issue:** Module not found
```bash
cd /home/wilsonh/Documents/GitHub/quonkboard
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Cannot connect to Labjack
- Verify Pi IP: `ping 192.168.0.100`
- Verify network: Check WiFi connection to "LanSolo"
- Try port 2707 (default Sphinx configuration)

---

## 📞 Documentation Files

- **Full Setup Guide:** `SETUP_AND_USAGE.md`
- **Project README:** `README.md`
- **Labjack Docs:** `/home/wilsonh/Documents/GitHub/labjack/LabJack Mission Control Documentation.md`

---

**Status:** ✅ Ready to Use
