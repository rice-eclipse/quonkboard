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
    const diagram = useRef();
    const telemetry = useRef();

    const processData = (data) => {
        console.log(lc_plot);
        if (data.load_cell && lc_plot.current) {
            lc_plot.current.addData({load_cell: data.load_cell});
        }
        if ((data.feed_line_pt || data.cc_pt || data.injector_pt || data.ox_tank_pt) && pt_plot.current) {
            pt_plot.current.addData({
                feed_line_pt: data.feed_line_pt,
                cc_pt: data.cc_pt,
                injector_pt: data.injector_pt,
                ox_tank_pt: data.ox_tank_pt,
            });
        }
        
    }

    setInterval(() => {
        processData({
            load_cell: 1,
            feed_line_pt: 1.5,
            cc_pt: 2.3,
            injector_pt: 3.0,
            ox_tank_pt: 4.0
        });
    }, 1000);

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
                            <DiagramControls sx={{position: "relative"}} ref={diagram}/>
                        </Grid>
                        <Grid item xs={4} sx={{alignContent: "center"}}>
                            <Typography sx={{textAlign: "center", mb: 1}} variant="h4">Telemetry Logs</Typography>
                            <Telemetry sx={{border: 1}} ref={telemetry}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainDisplay;