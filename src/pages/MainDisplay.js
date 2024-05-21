import { Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";
import Stack from "@mui/material/Stack"
import { LiveReadoutTable } from "../components/LiveReadoutTable";
import { DiagramControls } from "../components/DiagramControls";
import { IgnitionButton } from "../components/IgnitionButton";
import DataPlot from "../components/DataPlot";
import Telemetry from "../components/Telemetry";

import { useState, useEffect, useRef } from "react";

const MainDisplay = (props) => {
    const readoutTable = useRef();
    const lc_plot = useRef();
    const pt_plot = useRef();

    return (
        <Box>
            <Grid container spacing={2} sx={{px:2}}>
                <Grid item xs={2} sx={{textAlign: "center", alignItems: "center", justifyContent: "center", display: "flex"}}>
                    <Stack>
                        <LiveReadoutTable sx={{margin: { top: 10, bottom: 20 }}} ref={readoutTable}/>
                        <br />
                        <IgnitionButton />
                    </Stack>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={2} sx={{px:2}}>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <Typography sx={{textAlign: "center"}} variant="h4">Pressure Transducers</Typography>
                            <DataPlot ref={pt_plot}/>
                        </Grid>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <Typography sx={{textAlign: "center"}} variant="h4">Load Cell</Typography>
                            <DataPlot ref={lc_plot}/>
                        </Grid>
                        <Grid item xs={8} sx={{alignContent: "center", height: 350, my: 2.5}}>
                            <DiagramControls sx={{position: "relative"}}/>
                        </Grid>
                        <Grid item xs={4} sx={{alignContent: "center"}}>
                            <Typography sx={{textAlign: "center", mb: 1}} variant="h4">Telemetry Logs</Typography>
                            <Telemetry sx={{border: 1}}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainDisplay;