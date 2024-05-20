import React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import Typography from "@mui/material/Typography";

class GaugeReading extends React.Component {
    constructor(props) {
        super(props);
        let size = 70;
        if (props.size) {
            size = props.size;
        }
        this.state = {
            width: size,
            height: size,
            value: 60,
            title: props.title,
        }
    }
    render() {
        return (
        <div>
            <Gauge
            {...this.state}
            cornerRadius="50%"
            sx={(theme) => ({
                [`& .${gaugeClasses.valueText}`]: {
                fontSize: 25,
                },
                [`& .${gaugeClasses.valueArc}`]: {
                fill: '#52b202',
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                fill: theme.palette.text.disabled,
                },
            })}
            />
            <Typography sx={{mt: -1}}>{this.state.title}</Typography>
        </div>
        )
    }
}

export { GaugeReading };