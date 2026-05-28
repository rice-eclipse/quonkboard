# QuonkBoard

QuonkBoard is a React mission-control dashboard for Rice Eclipse engine test operations. It provides live telemetry views, engine diagrams, valve controls, ignition controls, and plotting for the Proxima, Sphinx, and Prometheus configurations.

## Project Structure

- `src/App.js` - Application shell, routing, dark Material UI theme, and shared connection state.
- `src/pages/` - Main display pages for Proxima, Sphinx, and Prometheus.
- `src/components/` - Dashboard UI widgets, including connection controls, live readouts, plots, telemetry logs, valve controls, ignition controls, and the top bar.
- `src/logic/` - Runtime data handling. `Interface.js` manages the WebSocket connection and command messages, while `DataManager.js` stores telemetry, logs, valve states, moving averages, and rate-of-change views.
- `src/configs/` - Engine-specific sensor and driver mappings used to translate incoming telemetry into dashboard fields.
- `src/diagrams/`, `src/styles/`, `src/audio/`, and `src/fonts/` - Static assets and styling for the dashboard experience.
- `public/` - Static HTML and manifest files used by Create React App.

## Installation

Install Node.js and npm, then install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The app will run at `http://localhost:3000` by default.

## Usage

1. Open the dashboard in a browser.
2. Select the appropriate engine display.
3. Enter the target WebSocket endpoint in `ip:port` format, such as `192.168.0.100:2707`.
4. Connect to begin receiving telemetry and enabling authenticated commands.

## Available Scripts

- `npm start` - Run the app in development mode.
- `npm test` - Launch the React test runner.
- `npm run build` - Create a production build in `build/`.

## Notes

QuonkBoard was bootstrapped with Create React App and uses React 18, React Router, Material UI, and MUI X Charts.
