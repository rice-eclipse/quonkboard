import React from 'react';
import open_valve from "../open_valve.svg";
import closed_valve from "../closed_valve.svg";
import Typography from "@mui/material/Typography";

class Valve extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        }
    }

    render() {
        let text_margin = 0;
        if (this.props.text_margin) {
            text_margin = this.props.text_margin;
        }
        if (this.props.text_bottom) {
            return (
                <div>
                    <img src={this.state.open ? open_valve : closed_valve} alt="valve" style={{height: 25}} />
                    <Typography sx={{fontSize: 20, color:(this.state.open ? "green" : "red"), mt: text_margin}}>{this.state.open ? "OPEN" : "CLOSED"}</Typography>
                    <Typography sx={{fontSize: 12, mt: "-5px"}}>{this.props.title}</Typography>
                </div>
            )
        }
        return (
            <div>
                <Typography sx={{fontSize: 12, mb: "-5px"}}>{this.props.title}:</Typography>
                <Typography sx={{mb: text_margin, fontSize: 20, color:(this.state.open ? "green" : "red")}}>{this.state.open ? "OPEN" : "CLOSED"}</Typography>
                <img src={this.state.open ? open_valve : closed_valve} alt="valve" style={{height: 25}} />
            </div>
        )
    }
}

export { Valve };