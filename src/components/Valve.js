import React from 'react';
import open_valve from "../open_valve.svg";
import closed_valve from "../closed_valve.svg";
import Typography from "@mui/material/Typography";
import { Button, Stack } from "@mui/material";

class Valve extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            authenticated: false
        }
        this.toggle_cmd = props.toggle_cmd;
        this.opposite = false;
        if (props.opposite) {
            this.opposite = true;
        }
    }

    setOpen = (open_state, auth_state) => {
        this.setState({open: open_state, authenticated: auth_state})
        console.log(this.state);
    }
    toggle = () => {
        this.toggle_cmd(!this.state.open);
    }
    
    render() {
        let text_margin = 0;
        if (this.props.text_margin) {
            text_margin = this.props.text_margin;
        }
        if (this.props.text_bottom) {
            return (
                <Stack>
                    <img src={(this.state.open ^ this.opposite) ? open_valve : closed_valve} alt="valve" style={{height: 25}} />
                    <Button disabled={!this.state.authenticated} onClick={this.toggle} sx={{fontSize: 20, border: 1, padding: 0,color:((this.state.open ^ this.opposite) ? "green" : "red"), mt: text_margin}}>{(this.state.open ^ this.opposite) ? "OPEN" : "CLOSED"}</Button>
                    <Typography sx={{fontSize: 12, mt: "-2px"}}>{this.props.title}</Typography>
                </Stack>
            )
        }
        return (
            <Stack>
                <Typography sx={{fontSize: 12, mb: "-2px"}}>{this.props.title}:</Typography>
                <Button disabled={!this.state.authenticated}  onClick={this.toggle} sx={{mb: text_margin, border: 1, padding: 0, fontSize: 20, color:((this.state.open ^ this.opposite) ? "green" : "red")}}>{(this.state.open ^ this.opposite) ? "OPEN" : "CLOSED"}</Button>
                <img src={(this.state.open ^ this.opposite) ? open_valve : closed_valve} alt="valve" style={{height: 25}} />
            </Stack>
        )
    }
}

export { Valve };