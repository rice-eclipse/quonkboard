import React from 'react';
import Box from '@mui/material/Box';
import Diagram from '../diagram.svg';
import { GaugeReading } from './GaugeReading';
import { Valve } from './Valve';
import "../styles/diagram.css"


class DiagramControls extends React.Component {
    constructor(props){
        super(props);
        this.gauge_refs = {
            load_cell: React.createRef(),
            feed_line_pt: React.createRef(),
            cc_pt: React.createRef(),
            injector_pt: React.createRef(),
            ox_tank_pt: React.createRef()
        }
    }

    update(dataManager) {
        const data = dataManager.modifiedDataset;
        console.log("help me", data);
        if (data === null || data.length === 0) {
            return;
        }
        for (const [sensor, val] of Object.entries(data[data.length - 1])) {
            if (sensor in this.gauge_refs && this.gauge_refs[sensor].current !== null) {
                this.gauge_refs[sensor].current.setValue(val);
            }
        }
    }

    render() {
        return (
            <div style={{position: "relative"}}>
                <img src={Diagram} alt="Diagram" style={{height: 350}}></img>
                <Box sx={{textAlign: "center"}} id="diagram-box">
                    <div id="feed_line_pt"></div>
                    <div id="cc_pt"><GaugeReading title="CC PT" ref={this.gauge_refs.cc_pt}/></div>
                    <div id="injector_pt"><GaugeReading title="Inj. PT" ref={this.gauge_refs.injector_pt}/></div>
                    <div id="ox_tank_pt"><GaugeReading title="Ox. PT" ref={this.gauge_refs.ox_tank_pt}/></div>
                    <div id="load_cell"><GaugeReading title="Load Cell" size={90} ref={this.gauge_refs.load_cell}/></div>
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