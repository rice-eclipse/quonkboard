import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Topbar from './components/Topbar';
import ProximaMainDisplay from './pages/ProximaMainDisplay';
import SphinxMainDisplay from './pages/SphinxMainDisplay';
import PrometheusMainDisplay from './pages/PrometheusMainDisplay';
import HomePage from './pages/HomePage';
import { useState } from 'react';
import partyPigeon from "./party-parrot.gif";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AnimatedCursor from 'react-animated-cursor';

const darkTheme = createTheme({
  typography: {
    fontFamily: "Jersey"
  },
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [pigeonMode, setPigeonMode] = useState(false);
  const [connection, setConnection] = useState({ ip: "", engineType: "" });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Topbar pigeonMode={pigeonMode} setPigeonMode={setPigeonMode} setConnection={setConnection} connection={connection}/>
        {pigeonMode ? <AnimatedCursor>{Array.from({ length: 2 }, (_, i) => <img src={partyPigeon} alt="party pigeon" style={{height: "30px"}} key={i} />)}</AnimatedCursor> : ""}
        <Routes>
          <Route path="/" element={<HomePage admin={false} pigeonMode={pigeonMode} ip={connection.ip} sx={{cursor: "default"}}/>} />
          <Route path="/ProximaMainDisplay" element={<ProximaMainDisplay admin={false} pigeonMode={pigeonMode} ip={connection.ip} configKey={connection.engineType} connection={connection} setConnection={setConnection} sx={{cursor: "default"}}/>} />
          <Route path="/SphinxMainDisplay" element={<SphinxMainDisplay admin={false} pigeonMode={pigeonMode} ip={connection.ip} configKey={connection.engineType} connection={connection} setConnection={setConnection} sx={{cursor: "default"}}/>} />
          <Route path="/PrometheusMainDisplay" element={<PrometheusMainDisplay admin={false} pigeonMode={pigeonMode} ip={connection.ip} configKey={connection.engineType} connection={connection} setConnection={setConnection} sx={{cursor: "default"}}/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
