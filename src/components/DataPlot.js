import React from 'react';

import { Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';

class DataPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            times: [new Date(Date.now() - 4), new Date(Date.now() - 3), new Date(Date.now() - 2), new Date(Date.now() - 1), new Date(Date.now())],
            vals: [0,0,0,0,0]
        }
    }

    valueFormatter = (date) => {
        console.log(date);
        return date.toLocaleTimeString('it-IT');
    }

    addData = (val) => {
        this.setState((state) => {
            return {times: [...state.times, Date.now()], vals: [...state.vals, val]};
        })
    }

    render() {
        return (
            <div>
                <LineChart
                    xAxis={[{ data: this.state.times, scaleType: "time", valueFormatter: this.valueFormatter }]}
                    series={[
                        {
                        data: this.state.vals,
                        valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                        },
                    ]}
                    height={300}
                    margin={{ top: 10, bottom: 20 }}
                />
            </div>
        );
    }
}

export default DataPlot;