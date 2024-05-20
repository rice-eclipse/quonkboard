import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Stack } from "@mui/material";
import Divider from '@mui/material/Divider';

const ConnectBar = () => {
    return (
        <Stack component="form" spacing={2} divider={<Divider orientation="vertical" flexItem />} direction="row" sx={{height: 90, p: 1, marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection:"row"}}>
            <TextField fullWidth sx={{display:"flex", marginRight: '8px'}} label="Connection IP" variant="filled" defaultValue="127.0.0.1:3000" />
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