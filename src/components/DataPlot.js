import React from 'react';

import { Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Stack from "@mui/material/Stack";
import Slider from '@mui/material/Slider';

class DataPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            sliderrange: null,
            slidervals: null,
            enabledGraphs: {},
        };
    }

    update(dataManager) {
        this.setState({data: dataManager.modifiedDataset});
    }

    valueFormatter = (date) => {
        return date.toLocaleTimeString('it-IT');
    }

    handleSliderChange = (event, newVals, activeThumb) => {
        if (!Array.isArray(newVals)) {
            return;
          }
          if (activeThumb === 0) {
            this.setState({slidervals: [Math.min(newVals[0], newVals[1] - 5000), newVals[1]]});
          } else {
            this.setState({slidervals: [newVals[0], Math.max(newVals[0] + 5000, newVals[1])]});
          }
    }

    handleGraphCheckboxChange = (event, key) => {
        const enabledGraphs = {...this.state.enabledGraphs};
        return this.setState((state) => {
            enabledGraphs[key] = event.target.checked;
            return { enabledGraphs: enabledGraphs};
        })
    }

    componentDidUpdate = () => {
        var min_time = 0.0;
        var max_time = 1.0;
        if (this.state.data.length > 0) {
            min_time = Math.min(...this.state.data.map((data_point) => data_point.time.getTime()));
            max_time = Math.max(...this.state.data.map((data_point) => data_point.time.getTime()));
        }
        var sliderJustPopulated = false;
        if (this.state.slidervals === null) {
            this.setState({slidervals: [min_time, max_time]});
            sliderJustPopulated = true;
            console.log("set state:", this.state.slidervals);
        }

        if (this.state.sliderrange === null || (sliderJustPopulated ? max_time : this.state.sliderrange[1]) < max_time) {
            if (!sliderJustPopulated && this.state.slidervals[1] === this.state.sliderrange[1]) {
                this.setState((state) => ({sliderrange: [min_time, max_time], slidervals: [state.slidervals[0], max_time]}));
            } else {
                this.setState({sliderrange: [min_time, max_time]});
            }
        }
        console.log("slider range", this.state.sliderrange);
    }

    render() {
        const graphs = new Set();
        this.state.data.forEach((data_point) => {
            Object.keys(data_point).forEach((key) => {
                if (key !== "time") {
                    graphs.add(key); // Get all keys that are not time
                }
            })
        });

        var changed = false;
        const enabledGraphs = {...this.state.enabledGraphs};
        for (const graph of graphs) {
            if (!(graph in this.state.enabledGraphs)) {
                enabledGraphs[graph] = true;
                changed = true;
            }
        }
        if (changed) {
            this.setState((state) => ({enabledGraphs: enabledGraphs}));
        }

        const enabledGraphsList = []
        for (const [graph, enabled] of Object.entries(this.state.enabledGraphs)) {
            if (enabled && this.props.keys.includes(graph)) {
                enabledGraphsList.push(graph);
            }
        }
        console.log(this.state.enabledGraphs);
        console.log(this.props.keys);
        console.log("enabled graph list", enabledGraphsList);
        
        return (
            <div>
                <Stack direction="column" spacing={0}>
                    <LineChart
                        xAxis={[{ scaleType: "time", dataKey: "time", valueFormatter: this.valueFormatter, ...(this.state.sliderrange === null ? {} : {max: new Date(this.state.slidervals[1]), min: new Date(this.state.slidervals[0])})}]}
                        series={enabledGraphsList.map((key) => ({
                            dataKey: key,
                            label: key,
                        }))}
                        dataset={this.state.data}
                        height={220}
                        margin={{ top: 50, bottom: 20 }}
                        grid={true}
                    />
                    <FormGroup aria-label="position" row sx={{textAlign: "center"}}>
                        {
                            Array.from(this.props.keys.values().map((key) => (
                                <FormControlLabel
                                    control={<Checkbox defaultChecked checked={this.state.enabledGraphs[key]} onChange={(event) => this.handleGraphCheckboxChange(event, key)}/>}
                                    label={key}
                                    labelPlacement="start"
                                /> 
                            )))
                        }
                    </FormGroup>
                    <Box sx={{px:3}}>
                        <Slider
                            value={this.state.slidervals}
                            onChange={this.handleSliderChange}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => (new Date(value)).toLocaleTimeString()}
                            disableSwap
                            min = {this.state.sliderrange === null ? 0 : this.state.sliderrange[0]}
                            max = {this.state.sliderrange === null ? 1 : this.state.sliderrange[1]}
                        />
                    </Box>
                </Stack>
            </div>
        );
    }
}

export default DataPlot;