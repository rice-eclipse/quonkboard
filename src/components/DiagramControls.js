import React from 'react';
import Box from '@mui/material/Box';
import Diagram from '../diagram.svg';
import { GaugeReading } from './GaugeReading';
import { Valve } from './Valve';
import "../styles/diagram.css"


class DiagramControls extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            load_cell: 0.0,
            feed_line_pt: 0.0,
            cc_pt: 0.0,
            injector_pt: 0.0,
            ox_tank_pt: 0.0
        }
    }

    render() {
        return (
            <div>
                <img src={Diagram} alt="Diagram" style={{height: 350, position: "absolute"}}></img>
                <Box sx={{textAlign: "center"}} id="diagram-box">
                    <div id="feed_line_pt"><GaugeReading title="Feed Line PT"/></div>
                    <div id="cc_pt"><GaugeReading title="CC PT"/></div>
                    <div id="injector_pt"><GaugeReading title="Inj. PT"/></div>
                    <div id="ox_tank_pt"><GaugeReading title="Ox. PT"/></div>
                    <div id="load_cell"><GaugeReading title="Load Cell" size={90}/></div>
                    <div id="ox_fill_valve"><Valve title="Oxidizer Fill Valve"/></div>
                    <div id="ground_vent_valve"><Valve title="Ground Vent Valve" text_bottom text_margin="22px"/></div>
                    <div id="nitrogen_purge_valve"><Valve title="Nitrogen Purge Valve"/></div>
                    <div id="engine_isolation_valve"><Valve title="Engine Isolation Valve"/></div>
                </Box>
            </div>
        )
    }
}

export { DiagramControls };