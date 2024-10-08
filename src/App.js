import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Topbar from './components/Topbar';
import MainDisplay from './pages/MainDisplay';
import PigeonMode from './components/PigeonMode';
import {useState } from 'react';
import partyPigeon from "./party-parrot.gif";
import { Typography } from '@mui/material';

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
  const [ip, setIP] = useState("");

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Topbar pigeonMode={pigeonMode} setPigeonMode={setPigeonMode} setIP={setIP}/>
        {pigeonMode ? <AnimatedCursor>{Array.from({ length: 2 }, (_, i) => <img src={partyPigeon} alt="party pigeon" style={{height: "30px"}}/>)}</AnimatedCursor> : ""}
        <Routes>
          <Route path="/" element={<MainDisplay admin={false} pigeonMode={pigeonMode} ip={ip} sx={{cursor: "default"}}/>} />
          <Route path="/admin" element={<MainDisplay admin={true} pigeonMode={pigeonMode} ip={ip} sx={{cursor: "default"}}/>} />
          {/* We should add a super secret code included in each request to slonkboard in case any impostor tries to be sus and send a request. 
          This requires labjack changes. */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
