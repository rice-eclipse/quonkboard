import React from 'react';

import { Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts';

import dayjs from 'dayjs';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Stack from "@mui/material/Stack";
import Slider from '@mui/material/Slider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

class DataPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            sliderrange: null,
            slidervals: null,
            enabledGraphs: {},
            constantTimeDelta: false,
        };
    }

    update(dataManager) {
        console.log(dataManager.modifiedDataset);
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
            if (this.state.constantTimeDelta) {
                newVals[1] = newVals[0] + this.state.slidervals[1] - this.state.slidervals[0];
                if (newVals[1] > this.state.sliderrange[1]) {
                    newVals = [this.state.sliderrange[1] - (this.state.slidervals[1] - this.state.slidervals[0]), this.state.sliderrange[1]];
                }
            }
            this.setState({slidervals: [Math.min(newVals[0], newVals[1] - 5000), newVals[1]]});
          } else {
            if (this.state.constantTimeDelta) {
                newVals[0] = newVals[1] - this.state.slidervals[1] + this.state.slidervals[0];
                if (newVals[0] < this.state.sliderrange[0]) {
                    newVals = [this.state.sliderrange[0], this.state.sliderrange[0] + (this.state.slidervals[1] - this.state.slidervals[0])];
                }
            }
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

    handleEarliestTimeChange = (date) => {
        if (date.toDate().getTime() < this.state.sliderrange[0]) {
            date = dayjs(new Date(this.state.sliderrange[0]));
        } else if (date.toDate().getTime() > this.state.slidervals[1]) {
            date = dayjs(new Date(this.state.slidervals[1]));
        }
        if (this.state.constantTimeDelta) {
            setTimeout(() => {
                this.setState((state) => (
                    {slidervals: [
                        date.toDate().getTime(), 
                        Math.min(
                            date.toDate().getTime() + (this.state.slidervals[1] - this.state.slidervals[0]),
                            this.state.sliderrange[1]
                        )] 
                    }
                ));
            }, 1000);
        } else {
            setTimeout(() => {
                this.setState((state) => ({slidervals: [date.toDate().getTime(), this.state.slidervals[1]]}));
            }, 1000);
        }
    }
    
    handleLatestTimeChange = (date) => {
        if (date.toDate().getTime() > this.state.sliderrange[1]) {
            date = dayjs(new Date(this.state.sliderrange[1]));
        } else if (date.toDate().getTime() < this.state.slidervals[0]) {
            date = dayjs(new Date(this.state.slidervals[0]));
        }
        if (this.state.constantTimeDelta) {
            setTimeout(() => {
                this.setState((state) => (
                    {slidervals: [
                        Math.max(
                            date.toDate().getTime() - (this.state.slidervals[1] - this.state.slidervals[0]),
                            this.state.sliderrange[0]
                        ),
                        date.toDate().getTime()]
                    }
                ));
            }, 1000);
        } else {
            setTimeout(() => {
                this.setState((state) => ({slidervals: [this.state.slidervals[0], date.toDate().getTime()]}));
            }, 1000);
        }
    }

    handleConstantTimeDeltaChange = (event) => {
        this.setState({constantTimeDelta: event.target.checked});
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
                const newSliderVals = [...this.state.slidervals];
                if (this.state.constantTimeDelta) {
                    newSliderVals[0] = this.state.slidervals[0] + max_time - this.state.sliderrange[1];
                }
                newSliderVals[1] = max_time;
                this.setState((state) => ({sliderrange: [min_time, max_time], slidervals: newSliderVals}));
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

        let data_in_range = 0;
        for (const data_point of this.state.data) {
            if (this.state.slidervals !== null && data_point.time.getTime() >= this.state.slidervals[0] && data_point.time.getTime() <= this.state.slidervals[1]) {
                data_in_range++;
            }
        }
        
        return (
            <div>
                <Stack direction="column" spacing={1.25}>
                    <div style={{position: "relative"}}>
                        <FormControlLabel 
                            sx={{position: "absolute", right: 20}}
                            label="Preserve timespan"
                            labelPlacement='start'
                            control={<Checkbox checked={this.state.constantTimeDelta} onChange={this.handleConstantTimeDeltaChange} />}
                        />
                            
                        <LineChart
                            slotProps={{
                                legend: {
                                    direction: "row",
                                    position: {vertical: "top", horizontal: "left"},
                                    padding: {left: 30, top: 6}
                                }
                            }}
                            xAxis={[{ 
                                scaleType: "time", 
                                dataKey: "time", 
                                valueFormatter: this.valueFormatter, 
                                ...(this.state.sliderrange === null ? {} : {
                                    max: new Date(this.state.slidervals[1]), min: new Date(this.state.slidervals[0])
                                })
                            }]}
                            series={enabledGraphsList.map((key) => ({
                                dataKey: key,
                                label: key,
                                showMark: (data_in_range < 30),
                            }))}
                            dataset={this.state.data}
                            height={220}
                            margin={{ top: 50, bottom: 20 }}
                            grid={true}
                        />
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack direction="row" spacing={0} sx={{px:3}}>
                            <TimePicker
                                label="Earliest Time"
                                views={['hours', 'minutes', "seconds"]}
                                disableOpenPicker
                                value={dayjs(Array.isArray(this.state.slidervals) ? new Date(this.state.slidervals[0]) : new Date(0))}
                                onChange={this.handleEarliestTimeChange}
                                sx={{mr: 3,
                                    '& .MuiInputBase-root': {
                                        fontSize: '0.8rem', // Adjust as needed
                                        height: '30px', // Adjust as needed
                                    } 
                                }}
                            />
                            <Slider
                                value={this.state.slidervals}
                                onChange={this.handleSliderChange}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => (new Date(value)).toLocaleTimeString()}
                                disableSwap
                                min = {this.state.sliderrange === null ? 0 : this.state.sliderrange[0]}
                                max = {this.state.sliderrange === null ? 1 : this.state.sliderrange[1]}
                            />
                            <TimePicker
                                label="Latest Time"
                                views={["hours", "minutes", "seconds"]}
                                disableOpenPicker
                                disableFuture
                                minTime={dayjs(Array.isArray(this.state.sliderrange) ? new Date(this.state.sliderrange[0]) : new Date(0))}
                                maxTime={dayjs(Array.isArray(this.state.sliderrange) ? new Date(this.state.sliderrange[1]) : new Date(0))}
                                value={dayjs(Array.isArray(this.state.slidervals) ? new Date(this.state.slidervals[1]) : new Date(0))}
                                onChange={this.handleLatestTimeChange}
                                sx={{ ml: 3,
                                    '& .MuiInputBase-root': {
                                        fontSize: '0.8rem', // Adjust as needed
                                        height: '30px', // Adjust as needed
                                    }
                                 }}
                            />
                        </Stack>
                        <FormGroup aria-label="position" row sx={{mt: -3, '& .MuiButtonBase-root': {
                            my:-2
                        }}}>
                        {
                            this.props.keys.length > 1 ?
                            Array.from(this.props.keys.map((key) => (
                                <FormControlLabel
                                    control={<Checkbox defaultChecked checked={this.state.enabledGraphs[key]} onChange={(event) => this.handleGraphCheckboxChange(event, key)}/>}
                                    label={key}
                                    labelPlacement="start"
                                /> 
                            ))) : null
                        }
                        </FormGroup>
                    </LocalizationProvider>
                </Stack>
            </div>
        );
    }
}

export default DataPlot;