import { Typography, Box } from "@mui/material";
import { Stack } from "@mui/material";
import partyPigeon from "../party-parrot.gif";
import logo from "../quonkboard.png";
import PigeonMode from "./PigeonMode"

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
            <Stack direction="row" sx={{width: 1.0, height: 90, mb:4}}>
                <Typography variant="h1" sx={{cursor: "pointer", pr:4}} onClick={handleHeadingClick}>Quonkboard</Typography>
                <Box justifyContent="space-between" alignItems="center" marginLeft="auto" marginRight="auto">
                    <PigeonMode enable={pigeonMode} />
                </Box>
                <img style={{"margin-top": "10px", "margin-right": "10px", "float":"right"}} src={logo} alt="logo"/>
            </Stack>
    )
}

export default Topbar;