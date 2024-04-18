import React from 'react';

class DataPlot extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: []
        }
    }
    render() {
        return (
            <div>
                <Typography sx={{textAlign: "center"}} variant="h2">1,548 psi</Typography>
                <LineChart
                    xAxis={[{ data: times }]}
                    series={[
                        {
                        data: vals,
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