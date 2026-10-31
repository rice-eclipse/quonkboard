import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Stack } from "@mui/material";
import Divider from '@mui/material/Divider';
import React, { useState } from "react";

const PI_ADDRESS = "192.168.0.100:2707";
const SIM_ADDRESS = "127.0.0.1:2707";

/**
 * ConnectBar component renders a form with a text field for connection IP, buttons that fill in
 * the Pi and simulator addresses, and a connect button. The address can't change while connected.
 */
const ConnectBar = (props) => {
    const { setConnection, engineType, connection} = props;
    const [address, setAddress] = useState(connection.ip || PI_ADDRESS);

    const isConnected = connection.ip && connection.engineType;

    const addressButton = (label, value) => (
        <Button
          variant={address === value ? "contained" : "outlined"}
          size="small"
          disabled={!!isConnected}
          onClick={() => setAddress(value)}
          sx={{height: 27, minWidth: 48}}
        >
          {label}
        </Button>
    );

    return (
        <Stack
            component="form"
            onSubmit={(event) => {
                event.preventDefault();
                setConnection(isConnected ? { ip: "", engineType: "" } : { ip: address, engineType });
            }}
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
            direction="row"
            sx={{height: 90, p: 1, mt: 2, marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection:"row"}}
        >
            <TextField
              fullWidth
              sx={{display:"flex", marginRight: '8px'}}
              label="Connection IP"
              variant="filled"
              value={address}
              disabled={!!isConnected}
              onChange={(event) => setAddress(event.target.value)}
            />
            <Stack spacing="4px" sx={{height: 58}}>
              {addressButton("Pi", PI_ADDRESS)}
              {addressButton("Sim", SIM_ADDRESS)}
            </Stack>
            <Button
              type="submit"
              variant="contained"
              sx={{display:"flex", height: 58}}
              margin="auto"
            >
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
        </Stack>
    );
};

export { PI_ADDRESS, SIM_ADDRESS };
export default ConnectBar;
