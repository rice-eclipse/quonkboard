import { Typography, Box } from "@mui/material";
import { Stack } from "@mui/material";
import partyPigeon from "../party-parrot.gif";
import logo from "../quonkboard.png";
import PigeonMode from "./PigeonMode";
import ConnectBar from "./ConnectBar";

const Topbar = (props) => {

    const { setPigeonMode, pigeonMode } = props;

    const handleHeadingClick = () => {
        // Reset the cursor style to its default value (auto)
        setPigeonMode(!pigeonMode);
        if (!pigeonMode) {
            document.body.style.cursor = 'default';
        }
      };

    return (
            <Stack direction="row" sx={{width: 1.0, height: 90, mb:4, display: 'flex', borderBottom: 1, p: 1}}>
                <img style={{"marginTop": "10px", "marginBottom": "10px", "marginRight": "10px", "float":"right"}} src={logo} alt="logo"/>
                <Typography variant="h2" sx={{cursor: "pointer", pr:4, display: 'flex'}} onClick={handleHeadingClick}>Quonkboard</Typography>
                <Box alignItems="center" display="flex" sx={{ marginLeft: "auto", marginRight: 0}}>
                    {pigeonMode ? <PigeonMode enable={pigeonMode} /> : <ConnectBar sx={{width: 1.0}}/> }
                </Box>
            </Stack>
    )
}

export default Topbar;