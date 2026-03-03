import React from 'react';
import Box from '@mui/material/Box';
import Sphinx_Diagram from '../diagrams/sphinx_diagram.svg';
import Proxima_Diagram from '../diagrams/proxima_diagram.svg';
import { GaugeReading } from './GaugeReading';
import { Valve } from './Valve';
import proxima_configs from '../configs/proxima_configs.json';
import sphinx_configs from '../configs/sphinx_configs.json';
import "../styles/proxima_diagram.css";
import "../styles/sphinx_diagram.css";

class DiagramControls extends React.Component {
    constructor(props){
        super(props);
        this.props = props;
        this.interface = props.interface.current;

        this.config = this.getActiveConfig();
        this.gauge_keys = this.getGaugeKeys(this.config);
        this.driver_keys = this.getDriverKeys(this.config);

        this.gauge_refs = this.gauge_keys.reduce((acc, key) => {
            acc[key] = React.createRef();
            return acc;
        }, {});

        this.valve_refs = this.driver_keys.reduce((acc, key) => {
            acc[key] = React.createRef();
            return acc;
        }, {});
    }

    getActiveConfig = () => {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("proximamaindisplay")) {
            return proxima_configs;
        }
        return sphinx_configs;
    }

    getGaugeKeys = (config) => {
        const pts = Object.values(config?.sensor_ids?.pts || {});
        const lcs = Object.values(config?.sensor_ids?.lcs || {});
        return [...new Set([...pts, ...lcs])];
    }

    getDriverKeys = (config) => {
        return Object.values(config?.sensor_ids?.drivers || {}).filter((driver) => driver !== "ignition");
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
        for (const driver of this.driver_keys) {
            if (this.valve_refs[driver]?.current) {
                this.valve_refs[driver].current.setOpen(Boolean(valves[driver]));
            }
        }
    }

    sendDriverCommand(driver_name) {
        return (state) => {
            this.interface?.sendDriverUpdate(driver_name, state);
        };
    }

    renderGauge = (sensor) => {
        return (
            <div key={sensor} id={sensor}>
                <GaugeReading
                    title={sensor}
                    size={sensor === "load_cell" ? 90 : 70}
                    ref={this.gauge_refs[sensor]}
                />
            </div>
        );
    }

    renderValve = (driver) => {
        return (
            <div key={driver} id={driver}>
                <Valve
                    title={driver}
                    toggle_cmd={this.sendDriverCommand(driver)}
                    ref={this.valve_refs[driver]}
                />
            </div>
        );
    }

    render() {
        const path = window.location.pathname.toLowerCase();
        const diagram = path.includes("proximamaindisplay") ? Proxima_Diagram : Sphinx_Diagram;

        return (
            <div style={{position: "relative"}}>
                <img src={diagram} alt="Diagram" style={{height: 550, width: 1000}}></img>
                <Box sx={{textAlign: "center"}} id="diagram-box">
                    {this.gauge_keys.map(this.renderGauge)}
                    {this.driver_keys.map(this.renderValve)}
                </Box>
            </div>
        );
    }
}

export { DiagramControls };
