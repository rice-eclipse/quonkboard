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
        this.displayRef = {};
        Object.keys(this.state).forEach((key) => {
            this.displayRef[key] = React.createRef();
        });
    }

    updateData(data) {
        for (const [sensor, val] of Object.entries(data)) {
            if (this.displayRef[sensor].current !== null) {
                this.displayRef[sensor].current.setValue(val);
            }
        }
    }

    render() {
        return (
            <div style={{position: "relative"}}>
                <img src={Diagram} alt="Diagram" style={{height: 350}}></img>
                <Box sx={{textAlign: "center"}} id="diagram-box">
                    <div id="feed_line_pt"><GaugeReading title="Feed Line PT" ref={this.displayRef["feed_line_pt"]}/></div>
                    <div id="cc_pt"><GaugeReading title="CC PT" ref={this.displayRef["cc_pt"]}/></div>
                    <div id="injector_pt"><GaugeReading title="Inj. PT" ref={this.displayRef["injector_pt"]}/></div>
                    <div id="ox_tank_pt"><GaugeReading title="Ox. PT" ref={this.displayRef["ox_tank_pt"]}/></div>
                    <div id="load_cell"><GaugeReading title="Load Cell" size={90} ref={this.displayRef["load_cell"]}/></div>
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