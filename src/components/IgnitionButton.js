import React from "react";
import Button from '@mui/material/Button';

const IgnitionButton = (props) => {
    const { callback } = props;
    return (
        <Button onClick={callback} variant="contained" color="error">
            Ignition
        </Button>
    )
}

export { IgnitionButton }