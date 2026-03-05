import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Stack } from "@mui/material";
import Divider from '@mui/material/Divider';
import React from "react";

/**
 * ConnectBar component renders a form with a text field for connection IP and a connect button.
 */
const ConnectBar = (props) => {
    const { setConnection, engineType } = props;

    return (
        <Stack
            component="form"
            onSubmit={(event) => {
                event.preventDefault();
                const ip = event.target[0].value;
                setConnection({ ip, engineType });
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
              defaultValue="192.168.0.100:2707"
            />
            <Button
              type="submit"
              variant="contained"
              sx={{display:"flex", height: 58}}
              margin="auto"
            >
              Connect
            </Button>
        </Stack>
    );
};

export default ConnectBar;
