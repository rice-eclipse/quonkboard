import { Typography, Box } from "@mui/material";
import { Stack } from "@mui/material";
import logo from "../quonkboard.png";
import PigeonMode from "./PigeonMode";
import ConnectBar from "./ConnectBar";
import { useLocation } from "react-router-dom";
import proximaConfig from "../configs/proxima_configs.json";
import sphinxConfig from "../configs/sphinx_configs.json";

const Topbar = (props) => {
    const { setPigeonMode, pigeonMode, setConnection, connection } = props;
    const location = useLocation();
    const path = location.pathname.toLowerCase();
    const showConnectBar = path.includes("proximamaindisplay") || path.includes("sphinxmaindisplay");
    const engineType = path.includes("proximamaindisplay") ? "proxima" : (path.includes("sphinxmaindisplay") ? "sphinx" : "");

    const getTitle = () => {
        if (path.includes("proximamaindisplay")) {
            return proximaConfig.Title;
        }
        if (path.includes("sphinxmaindisplay")) {
            return sphinxConfig.Title;
        }
        return "";
    };

    const handleHeadingClick = () => {
        setPigeonMode(!pigeonMode);
        if (!pigeonMode) {
            document.body.style.cursor = "default";
        }
    };

    return (
        <Stack direction="row" sx={{width: 1.0, height: 90, mb:2, display: "flex", borderBottom: 1, p: 1}}>
            {showConnectBar ? <img style={{marginTop: "10px", marginBottom: "10px", marginRight: "10px", float:"right"}} src={logo} alt="logo"/>: null}
            <Typography variant="h2" sx={{cursor: "pointer", pr:4, display: "flex"}} onClick={handleHeadingClick}>{getTitle()}</Typography>
            <Box alignItems="center" display="flex" sx={{ marginLeft: "auto", marginRight: 0}}>
                {pigeonMode ? <PigeonMode enable={pigeonMode} /> : (showConnectBar ? <ConnectBar sx={{width: 1.0}} setConnection={setConnection} connection={connection} engineType={engineType} /> : null)}
            </Box>
        </Stack>
    );
};

export default Topbar;
