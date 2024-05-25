import React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
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
            valueMin: 0,
            valueMax: 10,
            title: props.title,
            minMaxDisplay: "none"
        }
    }

    setValue(value) {
        if (isNaN(value) || value === null || value === undefined) {
            this.setState({value: null});
        } else {
            this.setState({value: (value < 10 ? value.toFixed(1) : Math.floor(value))});
        }
    }

    render() {
        return (
        <div style={{position: "relative"}}>
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
            onClick={() => {this.setState({minMaxDisplay: this.state.minMaxDisplay === "none" ? "block" : "none"})}}
            />
            <Typography sx={{mt: -1}}>{this.state.title}</Typography>
            <FormControl sx={{mt:4, width: 150, 
                "& .base-NumberInput-root input": {
                    width: 50
                },
                "& button": {
                    display: "none"
                },
                position: "absolute",
                top: 0,
                left: -40,
                display: this.state.minMaxDisplay
            }}>
                {/* <InputLabel htmlFor="valueMin">Min</InputLabel> */}
                <NumberInput
                    id="value-min"
                    onChange={(event, value) => this.setState({valueMin: value})}
                    value={this.state.valueMin}
                    autoComplete="off"
                />
                {/* <InputLabel htmlFor="valueMax">Max</InputLabel> */}
                <NumberInput
                    id="value-max"
                    onChange={(event, value) => this.setState({valueMax: value})}
                    value={this.state.valueMax}
                    autoComplete="off"
                />
            </FormControl>
        </div>
        )
    }
}

export { GaugeReading };