import { Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";
import Stack from "@mui/material/Stack"
import { LiveReadoutTable } from "../components/LiveReadoutTable";
import { DiagramControls } from "../components/DiagramControls";
import { IgnitionButton } from "../components/IgnitionButton";
import DataPlot from "../components/DataPlot";
import Telemetry from "../components/Telemetry";
import DataDisplayOptions from "../components/DataDisplayOptions";
import DataManager from "../logic/DataManager";
import Interface from "../logic/Interface";

import { useState, useEffect, useRef } from "react";

const MainDisplay = (props) => {
    const readoutTable = useRef();
    const lc_plot = useRef();
    const pt_plot = useRef();
    const diagram = useRef();
    const telemetry = useRef();

    const { ip } = props;

    // const [displayMode, setDisplayMode] = useState("rawData");
    // const [contextDuration, setContextDuration] = useState(10);
    // const [dataDevInterval, setDataDevInterval] = useState(null);
    // const [telemetryDevInterval, setTelemetryDevInterval] = useState(null);
    const [dataManager, setDataManager] = useState(new DataManager());
    const [iface, setInterface] = useState(null);

    if (ip !== "" && iface === null) {
        setInterface(new Interface(ip, dataManager));
    }

    const processData = (data) => {
        dataManager.addData(data);
        
        if (data.load_cell && lc_plot.current) {
            lc_plot.current.update(dataManager);
        }
        if ((data.feed_line_pt || data.cc_pt || data.injector_pt || data.ox_tank_pt) && pt_plot.current) {
            pt_plot.current.update(dataManager);
        }
        if (readoutTable !== null && readoutTable.current !== null && readoutTable.current !== undefined) {
            readoutTable.current.update(dataManager);
        }
        if (diagram !== null && diagram.current !== null && diagram.current !== undefined) {
            diagram.current.update(dataManager);
        }

        if (data.telemetry && telemetry.current !== null && telemetry.current !== undefined) {
            telemetry.current.update(dataManager);
        }
    }

    if (iface !== null) { iface.setOnData(processData); }

    // if (dataDevInterval === null) {
    //     setDataDevInterval(setInterval(() => {
    //         processData({
    //             load_cell: 1 + Math.random(),
    //             feed_line_pt: 1.5 + Math.random(),
    //             cc_pt: 2.3 + Math.random(),
    //             injector_pt: 3.0 + Math.random(),
    //             ox_tank_pt: 4.0 + Math.random()
    //         });
    //     }, 1000));
    //     setTelemetryDevInterval(setInterval(() => {
    //         processData({
    //             telemetry: "This is a test telemetry log"
    //         });
    //     }, 1500));
    // }

    return (
        <Box sx={{my:-2}}>
            <Grid container spacing={0}>
                <Grid item xs={2} sx={{textAlign: "center", alignItems: "center", justifyContent: "center", display: "flex"}}>
                    <Stack>
                        <LiveReadoutTable sx={{margin: { top: 10, bottom: 20 }}} ref={readoutTable} dataManager={dataManager}/>
                        <br />
                        <IgnitionButton />
                        <br />
                        <DataDisplayOptions dataManager={dataManager}/>
                    </Stack>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={0}>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            {/* <Typography sx={{textAlign: "center"}} variant="h5">Pressure Transducers</Typography> */}
                            <DataPlot ref={pt_plot} dataManager={dataManager} keys={["feed_line_pt", "cc_pt", "injector_pt", "ox_tank_pt"]}/>
                        </Grid>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            {/* <Typography sx={{textAlign: "center"}} variant="h5">Load Cell</Typography> */}
                            <DataPlot ref={lc_plot} dataManager={dataManager} keys={["load_cell"]}/>
                        </Grid>
                        <Grid item xs={8} sx={{alignContent: "center", height: 350, mt:-3}}>
                            <DiagramControls sx={{position: "relative"}} ref={diagram} dataManager={dataManager}/>
                        </Grid>
                        <Grid item xs={4} sx={{alignContent: "center", mt: -4}}>
                            <Typography sx={{textAlign: "center", mb: 1}} variant="h4">Telemetry Logs</Typography>
                            <Telemetry sx={{border: 1}} ref={telemetry} dataManager={dataManager}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainDisplay;