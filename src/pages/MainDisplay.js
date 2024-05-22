import { Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";
import Stack from "@mui/material/Stack"
import { LiveReadoutTable } from "../components/LiveReadoutTable";
import { DiagramControls } from "../components/DiagramControls";
import { IgnitionButton } from "../components/IgnitionButton";
import DataPlot from "../components/DataPlot";
import Telemetry from "../components/Telemetry";
import DataDisplayOptions from "../components/DataDisplayOptions";

import { useState, useEffect, useRef } from "react";

const MainDisplay = (props) => {
    const readoutTable = useRef();
    const lc_plot = useRef();
    const pt_plot = useRef();
    const diagram = useRef();
    const telemetry = useRef();
    const dataDisplayOptionsRef = useRef();

    const [displayMode, setDisplayMode] = useState("rawData");
    const [contextDuration, setContextDuration] = useState(10);
    const [devInterval, setDevInterval] = useState(null);

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
        if (readoutTable !== null && readoutTable.current !== null && readoutTable.current !== undefined) {
            readoutTable.current.updateData(data);
        }
        if (diagram !== null && diagram.current !== undefined) {
            diagram.current.updateData(data);
        }
    }

    if (devInterval === null) {
        setDevInterval(setInterval(() => {
            processData({
                load_cell: 1 + Math.random(),
                feed_line_pt: 1.5 + Math.random(),
                cc_pt: 2.3 + Math.random(),
                injector_pt: 3.0 + Math.random(),
                ox_tank_pt: 4.0 + Math.random()
            });
        }, 1000));
    }

    return (
        <Box>
            <Grid container spacing={1}>
                <Grid item xs={2} sx={{textAlign: "center", alignItems: "center", justifyContent: "center", display: "flex"}}>
                    <Stack>
                        <LiveReadoutTable sx={{margin: { top: 10, bottom: 20 }}} ref={readoutTable}/>
                        <br />
                        <IgnitionButton />
                        <br />
                        <DataDisplayOptions contextDuration={contextDuration} setContextDuration={setContextDuration} displayMode={displayMode} setDisplayMode={setDisplayMode}/>
                    </Stack>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={1}>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            {/* <Typography sx={{textAlign: "center"}} variant="h5">Pressure Transducers</Typography> */}
                            <DataPlot ref={pt_plot}/>
                        </Grid>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            {/* <Typography sx={{textAlign: "center"}} variant="h5">Load Cell</Typography> */}
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