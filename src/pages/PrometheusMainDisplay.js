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
import prometheus_config from "../configs/prometheus_configs.json";

import { useState, useEffect, useMemo, useRef } from "react";

const PrometheusMainDisplay = (props) => {
    const readoutTable = useRef();
    const lc_plot = useRef();
    const pt_plot = useRef();
    const diagram = useRef();
    const telemetry = useRef();

    const { ip, setConnection } = props;
    const iface = useRef();
    const auth_box = useRef();

    const engineConfig = prometheus_config;
    const pressureKeys = useMemo(() => Object.values(engineConfig.sensor_ids.pts || {}), [engineConfig]);
    const loadCellKeys = useMemo(() => Object.values(engineConfig.sensor_ids.lcs || {}), [engineConfig]);

    const [dataManager, setDataManager] = useState(new DataManager(engineConfig));
    const [authStatus, setAuthStatus] = useState(false);
    const [ignitedStatus, setIgnitedStatus] = useState(false);

    useEffect(() => {
        setDataManager(new DataManager(engineConfig));
        setAuthStatus(false);
        auth_box?.current?.setPassword("");
    }, [engineConfig]);

    useEffect(() => {
        const processData = (data) => {
            dataManager.addData(data);

            if (pressureKeys.some((key) => Object.prototype.hasOwnProperty.call(data, key)) && pt_plot.current) {
                pt_plot.current.update(dataManager);
            }
            if (loadCellKeys.some((key) => Object.prototype.hasOwnProperty.call(data, key)) && lc_plot.current) {
                lc_plot.current.update(dataManager);
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
            iface.current = new Interface(ip, engineConfig, setConnection);
            iface.current.setOnData(processData);
        }
        setIgnitedStatus(iface.current?.ignited);

        return () => {
            if (iface.current !== undefined) {
                iface.current.close();
            }
        };
    }, [ip, dataManager, engineConfig, pressureKeys, loadCellKeys, setConnection]);

    const ignitionSequence = (go) => {
        if (go) {
            iface.current?.sendIgnition();
            setIgnitedStatus(true);
        } else {
            iface.current?.sendIgnitionCancel();
        }
    };

    const setAuth = (password) => {
        if (iface.current !== undefined) {
            iface.current.setAuth(password);
            setAuthStatus(password === "quonk");
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
                        <IgnitionButton authenticated={authStatus} callback={ignitionSequence} ignited={ignitedStatus}/>
                        <br />
                        <AuthBox setAuth={setAuth} ref={auth_box}/>
                        <br />
                        <DataDisplayOptions dataManager={dataManager}/>
                    </Stack>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={0}>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <DataPlot ref={pt_plot} dataManager={dataManager} keys={pressureKeys}/>
                        </Grid>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <DataPlot ref={lc_plot} dataManager={dataManager} keys={loadCellKeys}/>
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

export default PrometheusMainDisplay;
