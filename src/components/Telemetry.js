import React from "react";
import {Typography, Box} from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

class Telemetry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: this.props.dataManager.getLogs(),
            bottom_scroll: true,
        }
        this.scrollRef = React.createRef();
        this.scrollRef2 = React.createRef();
    }

    update(dataManager) {
        this.setState({logs: dataManager.getLogs()});
    }

    handleChangeScroll = (event) => {
        this.setState({bottom_scroll: event.target.checked});
    }

    componentDidUpdate() {
        console.log(this.state.bottom_scroll)
        if (this.state.bottom_scroll) {
            if (this.scrollRef2 && this.scrollRef2.current) {
                this.scrollRef2.current.scrollIntoView({behavior: "smooth"})
            } else {
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
        }
    }

    addLog = (log) => {
        this.setState((state) => {
            return {logs: [...state.logs, log]}
        });
    }

    logDisplay = (log) => {
        return (
            <div style={{paddingBottom: "14px"}}>
                <Typography>{"[" + log.createdAt.toLocaleString() + "]"}</Typography>
                <Typography>{log.message}</Typography>
            </div>
        )
    }

    render() {
        return (
            <div>
                <Box ref={this.scrollRef} component="div" sx={{ height: 250, overflow: "auto", border: 1}}>
                    {
                        this.state.logs.map((log) => {
                            return this.logDisplay(log);
                        })
                    }
                    <div ref={this.scrollRef2} />
                </Box>
                <FormControlLabel control={<Checkbox checked={this.state.bottom_scroll} onChange={this.handleChangeScroll}/>} label="Scroll to bottom when new content loads" />
            </div>
        );
    }
}

export default Telemetry