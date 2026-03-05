import { Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";
import Stack from "@mui/material/Stack";
import { LiveReadoutTable } from "../components/LiveReadoutTable";
import { DiagramControls } from "../components/DiagramControls";
import { IgnitionButton } from "../components/IgnitionButton";
import DataPlot from "../components/DataPlot";
import Telemetry from "../components/Telemetry";
import DataDisplayOptions from "../components/DataDisplayOptions";
import DataManager from "../logic/DataManager";
import Interface from "../logic/Interface";
import AuthBox from "../components/AuthBox";
import proxima_config from "../configs/proxima_configs.json";
import sphinx_config from "../configs/sphinx_configs.json";

import { useState, useEffect, useRef } from "react";

const MainDisplay = (props) => {
    const readoutTable = useRef();
    const lc_plot = useRef();
    const pt_plot = useRef();
    const diagram = useRef();
    const telemetry = useRef();

    const { ip, configKey } = props;
    const iface = useRef();
    const auth_box = useRef();

    const engineConfig = configKey === "proxima" ? proxima_config : sphinx_config;

    const [dataManager, setDataManager] = useState(new DataManager(engineConfig));
    const [authStatus, setAuthStatus] = useState(false);

    useEffect(() => {
        setDataManager(new DataManager(engineConfig));
        setAuthStatus(false);
        auth_box?.current?.setPassword("");
    }, [engineConfig]);

    useEffect(() => {
        const processData = (data) => {
            dataManager.addData(data);

            if (data.load_cell && lc_plot.current) {
                lc_plot.current.update(dataManager);
            }
            if ((data.feed_line_pt || data.cc_pt || data.injector_pt || data.ox_tank_pt) && pt_plot.current) {
                pt_plot.current.update(dataManager);
            }
            if (readoutTable?.current) {
                readoutTable.current.update(dataManager);
            }
            if (diagram?.current) {
                diagram.current.update(dataManager);
            }

            if (data.telemetry && telemetry?.current) {
                telemetry.current.update(dataManager);
            }
        };

        if (ip !== "") {
            iface.current = new Interface(ip, engineConfig);
            iface.current.setOnData(processData);
        }

        return () => {
            if (iface.current !== undefined) {
                iface.current.close();
            }
        };
    }, [ip, dataManager, engineConfig]);

    const ignitionSequence = (go) => {
        if (go) {
            iface.current?.sendIgnition();
        } else {
            iface.current?.sendIgnitionCancel();
        }
    };

    const setAuth = (password) => {
        const isAuthenticated = password === "quonk";
        if (iface.current !== undefined) {
            iface.current.setAuth(password);
            setAuthStatus(isAuthenticated);
        } else {
            auth_box?.current?.setPassword("");
            setAuthStatus(false);
        }
    };

    return (
        <Box sx={{my:-2}}>
            <Grid container spacing={0}>
                <Grid item xs={2} sx={{textAlign: "center", alignItems: "center", justifyContent: "center", display: "flex"}}>
                    <Stack>
                        <LiveReadoutTable sx={{margin: { top: 10, bottom: 20 }}} ref={readoutTable} dataManager={dataManager}/>
                        <br />
                        <IgnitionButton authenticated={authStatus} callback={ignitionSequence}/>
                        <br />
                        <AuthBox setAuth={setAuth} ref={auth_box}/>
                        <br />
                        <DataDisplayOptions dataManager={dataManager}/>
                    </Stack>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={0}>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <DataPlot ref={pt_plot} dataManager={dataManager} keys={["feed_line_pt", "cc_pt", "injector_pt", "ox_tank_pt"]}/>
                        </Grid>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <DataPlot ref={lc_plot} dataManager={dataManager} keys={["load_cell"]}/>
                        </Grid>
                        <Grid item xs={8} sx={{alignContent: "center", height: 350, mt:5}}>
                            <DiagramControls authenticated={authStatus} sx={{position: "relative"}} ref={diagram} interface={iface} dataManager={dataManager}/>
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
};

export default MainDisplay;
