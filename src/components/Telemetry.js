import React from "react";
import {Typography, Box} from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

class Log {
    constructor(content) {
        this.createdAt = new Date();
        this.content = content;
    }

    displayText() {
        return (
            <div style={{paddingBottom: "14px"}}>
                <Typography>{"[" + this.createdAt.toLocaleString() + "]"}</Typography>
                <Typography>{this.content}</Typography>
            </div>
        )
    }
}

class Telemetry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: Array(20).fill(new Log("Telemetry initialized!")),
            bottom_scroll: true,
        }
        this.scrollRef = React.createRef();
        this.scrollRef2 = React.createRef();
        setInterval(() => {
            this.addLog("hi there");
        }, 1000);
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

    addLog = (message) => {
        this.setState((state) => {
            return {logs: [...state.logs, new Log(message)]}
        });
    }

    render() {
        return (
            <div>
                <Box ref={this.scrollRef} component="div" sx={{ height: 275, overflow: "auto", border: 1}}>
                    {
                        this.state.logs.map((log) => {
                            return log.displayText();
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