import React from 'react';
import logo from "../quonkboard.png";
import eclipseLogo from "../Rice_Eclipse_Vertical_White.svg";
import "../styles/background.css"
import Button from '@mui/material/Button';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate
  } from "react-router-dom";

import ProximaMainDisplay from './ProximaMainDisplay';
import SphinxMainDisplay from './SphinxMainDisplay';
import PrometheusMainDisplay from './PrometheusMainDisplay';

const HomePage = ({ type }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '100vh',
            gap: '0.5rem',
        }}>

        <div class="stars"></div>
        <div class="shooting-star"></div>
        <div class="shooting-star"></div>
        <div class="shooting-star"></div>
        <div class="shooting-star"></div>
        <div class="shooting-star"></div>
        


            <img src={eclipseLogo} alt="eclipseLogo" style={{height: '150px', marginTop: '2vh', marginLeft: '60px', position: 'relative'}}></img>
            <h1 style={{fontSize: '6.5rem'}}> Quonkboard</h1>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            <Button variant="contained" onClick={() => navigate('./ProximaMainDisplay')}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        width: '200px',
                        fontSize: '25px',
                        '&:hover': { backgroundColor: '#333' },
                    }}
                >
                    Proxima
                </Button>
            <Button variant="contained" onClick={() => navigate('./SphinxMainDisplay')}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        width: '200px',
                        fontSize: '25px',
                        '&:hover': { backgroundColor: '#333' },
                    }}
                >
                    Sphinx
                </Button>
            <Button variant="contained" onClick={() => navigate('./PrometheusMainDisplay')}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        width: '200px',
                        fontSize: '25px',
                        '&:hover': { backgroundColor: '#333' },
                    }}
                >
                    Prometheus
                </Button>
            </div>
            <Routes>
                <Route path='test' element={<ProximaMainDisplay />} />
                <Route path='test' element={<SphinxMainDisplay />} />
                <Route path='test' element={<PrometheusMainDisplay />} />
            </Routes>
        </div>
    );
}

export default HomePage;
