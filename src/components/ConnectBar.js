import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Stack } from "@mui/material";
import Divider from '@mui/material/Divider';
import React from "react";
import Interface from '../logic/Interface';

/**
 * ConnectBar component renders a form with a text field for connection IP and a connect button.
 * 
 * @param {Object} props - The properties object.
 * @param {Function} props.setInterface - The function to set the interface when the connect button is clicked.
 * @returns {JSX.Element} The rendered ConnectBar component.
 */
const ConnectBar = (props) => {
    const { setIP } = props;
    return (
        <Stack component="form" onSubmit={(event) => {
            event.preventDefault();
            setIP(event.target[0].value);
            console.log("Setting IP to %s", event.target[0].value)
        }} spacing={2} divider={<Divider orientation="vertical" flexItem />} direction="row" sx={{height: 90, p: 1, mt: 2, marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection:"row"}}>
            <TextField 
              fullWidth 
              sx={{display:"flex", marginRight: '8px'}} 
              label="Connection IP" 
              variant="filled" 
              defaultValue="127.0.0.1:2707"/>
            <Button
              type="submit"
              variant="contained"
              sx={{display:"flex", height: 58}}
              margin="auto"
            >
              Connect
            </Button>
        </Stack>
    )
}

export default ConnectBar;