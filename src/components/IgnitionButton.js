import React from "react";
import Button from '@mui/material/Button';
import { useState } from "react";

const IgnitionButton = (props) => {
    const callback = props.callback;
    const authenticated = props.authenticated;
    const ignited = props.ignited;
    const [ ignitionInProgress, setIgnitionInProgress] = useState(false);
    const ignition_callback = () => {
        callback(!ignitionInProgress);
        setIgnitionInProgress(!ignitionInProgress);
    }
    return (
        <Button disabled={!authenticated} onClick={ignition_callback} variant="contained" color={ignitionInProgress ? "warning" : "error"}>
            {ignitionInProgress ? "Abort Ignition" : "Ignition"}
            
        </Button>
    )
}

export { IgnitionButton }