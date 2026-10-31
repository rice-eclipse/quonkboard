# QuonkBoard

QuonkBoard is a React mission-control dashboard for Rice Eclipse engine test operations. It provides live telemetry views, engine diagrams, valve controls, ignition controls, and plotting for the Sphinx and Prometheus configurations.

## Project Structure

- `src/App.js` - Application shell, routing, dark Material UI theme, and shared connection state.
- `src/pages/` - Main display pages for Proxima, Sphinx, and Prometheus.
- `src/components/` - Dashboard UI widgets, including connection controls, live readouts, plots, telemetry logs, valve controls, ignition controls, and the top bar.
- `src/logic/` - Runtime data handling. `Interface.js` manages the WebSocket connection and command messages, while `DataManager.js` stores telemetry, logs, valve states, moving averages, and rate-of-change views.
- `src/configs/` - Engine-specific sensor and driver mappings used to translate incoming telemetry into dashboard fields.
- `src/diagrams/`, `src/styles/`, `src/audio/`, and `src/fonts/` - Static assets and styling for the dashboard experience.
- `public/` - Static HTML and manifest files used by Create React App.

## Prerequisites

This guide assumes you already have Git and a web browser (Chrome, Firefox, or Edge). The only other thing you need is **Node.js (LTS version)**. npm, which installs the dependencies and runs `npm start`, is included with Node.js.

Download the LTS installer from https://nodejs.org/en/download and run it with the default options. Alternatively, from a terminal:

```bash
# Windows (PowerShell)
winget install OpenJS.NodeJS.LTS

# macOS (requires Homebrew, https://brew.sh)
brew install node

# Ubuntu / Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

A code editor such as [VS Code](https://code.visualstudio.com/) is optional, but it has a built-in terminal that makes the steps below easier.

**Close and reopen your terminal after installing**, then check that everything is installed correctly. Each command should print a version number:

```bash
git --version
node --version
npm --version
```

If a command says it is not recognized or not found, see [Troubleshooting](#troubleshooting). On Ubuntu / Debian, the version of Node.js from `apt` can be very old. If `node --version` prints something older than `v18`, install the LTS version from https://nodejs.org/en/download instead.

## Installation

The computer needs internet access for this section, so do it **before** you connect to the labjack over ethernet.

1. Open a terminal. On Windows, search for "PowerShell" in the Start menu. On macOS, open "Terminal". On Linux, open your terminal app (`Ctrl + Alt + T` on Ubuntu). If you installed VS Code, you can use its built-in terminal instead.
2. Download the code and move into the project folder:

```bash
git clone https://github.com/rice-eclipse/quonkboard.git
cd quonkboard
```

3. Install the project dependencies. This can take a few minutes. You only need to do this once, or again after the dependencies in `package.json` change:

```bash
npm install
```

## Development
1. Make sure your terminal is in the `quonkboard` folder, then start the development server:

```bash
npm start
```

2. Wait until the terminal says it compiled successfully. Your browser should open automatically. If it does not, open `http://localhost:3000` yourself.

The app will run at `http://localhost:3000` by default.

The page can be refreshed after edits are made to reflect changes

To stop the server, click on the terminal and press `Ctrl + C`. Leave the terminal open while you are using the dashboard, since closing it stops the server.

On Windows you can also double-click `windows_start.bat` to start the server without typing anything. It runs `npm start` for you, but you still need to run `npm install` first.

The dashboard runs on your own computer, so `npm start` and `localhost:3000` work without any network connection.

## Troubleshooting
- **`npm`, `node`, or `git` is not recognized / command not found:** Close and reopen your terminal, or restart your computer, so it picks up the new install. If it still fails, reinstall Node.js or Git.
- **`npm install` fails or `Module not found` appears when starting:** Check that you have internet access (not just the ethernet link to the labjack), then delete the `node_modules` folder and `package-lock.json` and run `npm install` again.
- **Port 3000 is already in use:** Another copy of the dashboard or program is using it. Close it, or type `Y` when asked if you want to use another port and open the address shown in the terminal.
- **The dashboard opens but will not connect:** Check that the ethernet cable is plugged in at both ends, that your computer has an address on `192.168.0.x`, that `ping 192.168.0.100` gets a reply, that the labjack service is running on the RPi, and that the `ip:port` is correct.
- **Commands are rejected with `Invalid password`:** Re-enter the password in the `Password` box and check that it matches the labjack config on the RPi.

## Notes
QuonkBoard was bootstrapped with Create React App and uses React 18, React Router, Material UI, and MUI X Charts.