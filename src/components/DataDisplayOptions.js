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
        this.state = {dataManager : props.dataManager};
    }

    handleRadioChange = (event) => {
        this.props.dataManager.updateDisplayMode(event.target.value, this.props.dataManager.contextDuration);
        this.setState({dataManager: this.props.dataManager});
    }

    handleDurationChange = (event) => {
        this.props.dataManager.updateDisplayMode(this.props.dataManager.displayMode, event.target.value);
        this.setState({dataManager: this.props.dataManager});
    }

    render() {
        return (
            <div style={{border: "1px white"}}>
                <FormControl>
                    <FormLabel id="data-display-mode-label">Data Display Settings</FormLabel>
                    <RadioGroup
                        aria-labelledby="data-display-mode-label"
                        name="data-display-mode"
                        value={this.props.dataManager.displayMode}
                        onChange={this.handleRadioChange}
                    >
                        <FormControlLabel value="rawData" control={<Radio />} label="Raw Data" sx={{my:-1}}/>
                        <FormControlLabel value="movingAverage" control={<Radio />} label="Moving Average" sx={{my:-1}}/>
                        <FormControlLabel value="rateOfChange" control={<Radio />} label="Rate of Change" sx={{my:-1}}/>
                    </RadioGroup>
                </FormControl>
                <FormControl sx={{mt:4, width: 150}}>
                    <InputLabel htmlFor="context-length">Context Length</InputLabel>
                    <Input
                        id="context-length"
                        disabled={this.props.dataManager.displayMode === "rawData"}
                        onChange={this.handleDurationChange}
                        value={this.props.dataManager.contextDuration}
                        endAdornment={<InputAdornment position="right">seconds</InputAdornment>}
                        autoComplete="off"
                    />
                </FormControl>
            </div>
        );
    }
}

export default DataDisplayOptions