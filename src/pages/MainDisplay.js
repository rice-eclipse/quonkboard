import { Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';

const MainDisplay = (props) => {
    const { admin, pigeonMode } = props;
    return (
        <Box>
            <Typography> Main Display {!admin || "ADMIN"} </Typography>
            <Grid container spacing={2} sx={{px:2}}>
                <Grid item xs={6} sx={{textAlign: "center"}}>
                    <Typography variant="h2">598 psi</Typography>
                </Grid>
                <Grid item xs={6} sx={{textAlign: "center"}}>
                    <Typography variant="h2">1,548,392 psi</Typography>
                </Grid>
                <Grid item xs={6}>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 8, 10, 12, 15, 16] }]}
                        series={[
                            {
                            data: [2, 5.5, 2, 8.5, 1.5, 5, 6, 5, 6],
                            valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                            },
                        ]}
                        height={300}
                        margin={{ top: 10, bottom: 20 }}
                        />
                </Grid>
                <Grid item xs={6}>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 8, 10, 12, 15, 16] }]}
                        series={[
                            {
                            data: [2, 5.5, 2, 8.5, 1.5, 5],
                            valueFormatter: (value) => (value == null ? 'NaN' : value.toString()),
                            },
                            {
                            data: [null, null, null, null, 5.5, 2, 8.5, 1.5, 5],
                            },
                            {
                            data: [7, 8, 5, 4, null, null, 2, 5.5, 1],
                            valueFormatter: (value) => (value == null ? '?' : value.toString()),
                            },
                        ]}
                        height={200}
                        margin={{ top: 10, bottom: 20 }}
                        />
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainDisplay;