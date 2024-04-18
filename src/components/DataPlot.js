import React from 'react';

const DataPlot = () => {
    return (
        <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10, 12, 15, 16] }]}
            series={[
                {
                data: [2, 5.5, 2, 8.5, 1.5, 5, 6, 5, 6],
                valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                },
            ]}
            height={300}
            margin={{ top: 10, bottom: 20 }}
        />
    );
}

export default DataPlot;