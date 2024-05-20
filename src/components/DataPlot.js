import React from 'react';

import { Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';

class DataPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            times: [],
            vals: []
        }
    }

    addData = (val) => {
        this.setState({
            times: this.state.times.concat(Date.now()),
            vals: this.state.vals.concat(val)
        })
    }

    render() {
        return (
            <div>
                <Typography sx={{textAlign: "center"}} variant="h2">1,548 psi</Typography>
                <LineChart
                    xAxis={[{ data: this.state.times }]}
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