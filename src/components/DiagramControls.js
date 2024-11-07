import React from 'react';
import Box from '@mui/material/Box';
import Diagram from '../diagram.svg';
import { GaugeReading } from './GaugeReading';
import { Valve } from './Valve';
import "../styles/diagram.css"


class DiagramControls extends React.Component {
    constructor(props){
        super(props);
        this.props = props;
        this.interface = props.interface.current;
        this.gauge_refs = {
            load_cell: React.createRef(),
            feed_line_pt: React.createRef(),
            cc_pt: React.createRef(),
            injector_pt: React.createRef(),
            ox_tank_pt: React.createRef()
        };
        this.valve_refs = {
            ox_fill: React.createRef(),
            ground_vent: React.createRef(),
            nitrogen_purge: React.createRef(),
            engine_isolation: React.createRef()
        };
    }

    update(dataManager) {
        const data = dataManager.modifiedDataset;
        this.interface = this.props.interface.current;
        if (data === null || data.length === 0) {
            return;
        }
        for (const [sensor, val] of Object.entries(data[data.length - 1])) {
            if (sensor in this.gauge_refs && this.gauge_refs[sensor].current !== null) {
                this.gauge_refs[sensor].current.setValue(val);
            }
        }
        const valves = dataManager.valve_states;
        this.valve_refs.ox_fill.current.setOpen(valves.ox_fill);
        this.valve_refs.engine_isolation.current.setOpen(valves.engine_isolation);
        this.valve_refs.nitrogen_purge.current.setOpen(valves.nitrogen_purge);
        this.valve_refs.ground_vent.current.setOpen(valves.ground_vent);
    }

    sendDriverCommand(driver_name) {
        return (state) => {
            this.interface?.sendDriverUpdate(driver_name, state)
        }
    }

    render() {
        return (
            <div style={{position: "relative"}}>
                <img src={Diagram} alt="Diagram" style={{height: 350}}></img>
                <Box sx={{textAlign: "center"}} id="diagram-box">
                    <div id="feed_line_pt"><GaugeReading title="Feed Line PT" ref={this.gauge_refs.feed_line_pt}/></div>
                    <div id="cc_pt"><GaugeReading title="CC PT" ref={this.gauge_refs.cc_pt}/></div>
                    <div id="injector_pt"><GaugeReading title="Inj. PT" ref={this.gauge_refs.injector_pt}/></div>
                    <div id="ox_tank_pt"><GaugeReading title="Ox. PT" ref={this.gauge_refs.ox_tank_pt}/></div>
                    <div id="load_cell"><GaugeReading title="Load Cell" size={90} ref={this.gauge_refs.load_cell}/></div>
                    <div id="ox_fill_valve"><Valve title="Oxidizer Fill Valve" toggle_cmd={this.sendDriverCommand("feedline")} ref={this.valve_refs.ox_fill}/></div>
                    <div id="ground_vent_valve"><Valve title="Ground Vent Valve" toggle_cmd={this.sendDriverCommand("ground_vent")} ref={this.valve_refs.ground_vent} text_bottom text_margin="22px"/></div>
                    <div id="nitrogen_purge_valve"><Valve title="Nitrogen Purge Valve" toggle_cmd={this.sendDriverCommand("ox_vent")} ref={this.valve_refs.nitrogen_purge}/></div>
                    <div id="engine_isolation_valve"><Valve title="Engine Isolation Valve" toggle_cmd={this.sendDriverCommand("pressurization")} ref={this.valve_refs.engine_isolation}/></div>
                </Box>
            </div>
        )
    }
}

export { DiagramControls };