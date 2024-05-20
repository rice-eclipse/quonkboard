import { Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';
import Stack from "@mui/material/Stack"
import { LiveReadoutTable } from "../components/LiveReadoutTable";
import { DiagramControls } from "../components/DiagramControls";
import { IgnitionButton } from "../components/IgnitionButton";

const MainDisplay = (props) => {
    return (
        <Box>
            <Grid container spacing={2} sx={{px:2}}>
                <Grid item xs={2} sx={{textAlign: "center", alignItems: "center", justifyContent: "center", display: "flex"}}>
                    <Stack>
                        <LiveReadoutTable sx={{margin: { top: 10, bottom: 20 }}}/>
                        <br />
                        <IgnitionButton />
                    </Stack>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={2} sx={{px:2}}>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <Typography sx={{textAlign: "center"}} variant="h4">Pressure Transducers</Typography>
                            <LineChart
                                xAxis={[{ data: [1, 2, 3, 5, 8, 10, 12, 15, 16] }]}
                                series={[
                                    {
                                    data: [2, 5.5, 2, 8.5, 1.5, 5, 6, 5, 6],
                                    valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                                    },
                                ]}
                                height={250}
                                margin={{ top: 10, bottom: 20 }}
                            />
                        </Grid>
                        <Grid item xs={6} sx={{textAlign: "center"}}>
                            <Typography sx={{textAlign: "center"}} variant="h4">Load Cell</Typography>
                            <LineChart
                                xAxis={[{ data: [1, 2, 3, 5, 8, 10, 12, 15, 16] }]}
                                series={[
                                    {
                                    data: [2, 5.5, 2, 8.5, 1.5, 5, 6, 5, 6],
                                    valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                                    },
                                ]}
                                height={250}
                                margin={{ top: 10, bottom: 20 }}
                                />
                        </Grid>
                        <Grid item xs={12} sx={{alignContent: "center"}}>
                            <DiagramControls />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainDisplay;