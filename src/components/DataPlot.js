import React from 'react';

import { Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';

class DataPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: {}
        }
    }

    valueFormatter = (date) => {
        console.log(date);
        return date.toLocaleTimeString('it-IT');
    }

    addData = (data) => {
        this.setState((state) => {
            let newState = {...state};

            // Add new data and create new lines if appropriate
            for (const [key, value] of Object.entries(data)) {
                if (!(key in newState.data)) {
                    newState.data[key] = [];
                }
                newState.data[key].push({time: new Date(Date.now()), value: value})
            }

            // Delete any data over a minute old
            for (const [key, _] of Object.entries(newState.data)) {
                for (const data_point of newState[key]) {
                    if (new Date(Date.now()).getTime() - data_point.time.getTime() > 60_000) {
                        delete newState[key];
                    }
                }
            }

            return newState;
        })
    }

    render() {
        const data = {};
        for (const [line_key, line_val] of Object.entries(this.state.data)) {
            const line_data = {x: [], y: []}
            for (const {time, value} of line_val) {
                line_data.x.push(time);
                line_data.y.push(value);
            }
            data[line_key] = line_data;
        }
        console.log("Data", data);
        return (
            <div>
                <LineChart
                    xAxis={[{ scaleType: "time", valueFormatter: this.valueFormatter }]}
                    data={{ datasets: [{ data }] }}
                    height={300}
                    margin={{ top: 10, bottom: 20 }}
                />
            </div>
        );
    }
}

export default DataPlot;