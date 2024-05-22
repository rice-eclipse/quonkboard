import React from "react";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';

class DataDisplayOptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            context_duration: 10,
            mode: "rawData"
        }
    }

    handleRadioChange = (event) => {
        this.props.setDisplayMode(event.target.value);
    }

    handleDurationChange = (event) => {
        this.props.setContextDuration(event.target.value);
    }

    render() {
        return (
            <div style={{border: "1px white"}}>
                <FormControl>
                    <FormLabel id="data-display-mode-label">Data Display Settings</FormLabel>
                    <RadioGroup
                        aria-labelledby="data-display-mode-label"
                        name="data-display-mode"
                        value={this.props.displayMode}
                        onChange={this.handleRadioChange}
                    >
                        <FormControlLabel value="rawData" control={<Radio />} label="Raw Data" />
                        <FormControlLabel value="movingAvg" control={<Radio />} label="Moving Average" />
                        <FormControlLabel value="rateOfChange" control={<Radio />} label="Rate of Change" />
                    </RadioGroup>
                </FormControl>
                <FormControl sx={{mt:4, width: 150}}>
                    <InputLabel htmlFor="context-length">Context Length</InputLabel>
                    <Input
                        id="context-length"
                        disabled={this.state.mode === "rawData"}
                        onChange={this.handleDurationChange}
                        value={this.props.contextDuration}
                        endAdornment={<InputAdornment position="right">seconds</InputAdornment>}
                    />
                </FormControl>
            </div>
        );
    }
}

export default DataDisplayOptions