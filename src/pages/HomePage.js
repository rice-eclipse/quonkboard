import React from 'react';
import logo from "../quonkboard.png";
import Button from '@mui/material/Button';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate
  } from "react-router-dom";

import ProximaMainDisplay from './ProximaMainDisplay';
import SphinxMainDisplay from './SphinxMainDisplay';

const HomePage = ({ type }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px',
        }}>
            <h1 style={{fontSize: '5.5rem'}}> Quonkboard</h1>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            <Button variant="contained" onClick={() => navigate('./ProximaMainDisplay')}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        width: '200px',
                        '&:hover': { backgroundColor: '#333' },
                    }}
                >
                    Proxima
                </Button>
            <Button variant="contained" onClick={() => navigate('./ProximaMainDisplay')}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        width: '200px',
                        '&:hover': { backgroundColor: '#333' },
                    }}
                >
                    Sphinx
                </Button>
            <Button disabled='true' variant="contained" onClick={() => navigate('./ProximaMainDisplay')}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        width: '200px',
                        '&:hover': { backgroundColor: '#333' },
                    }}
                >
                    Prometheus
                </Button>
            </div>
            <Routes>
                <Route path='test' element={<ProximaMainDisplay />} />
                <Route path='test' element={<SphinxMainDisplay />} />
            </Routes>
        </div>
    );
}

export default HomePage;