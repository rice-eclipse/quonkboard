import React from "react"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

class LiveReadoutTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                load_cell: 0.0,
                feed_line_pt: 0.0,
                cc_pt: 0.0,
                injector_pt: 0.0,
                ox_tank_pt: 0.0,
            },
            unit: {
                load_cell: "lbf",
                feed_line_pt: "psig",
                cc_pt: "psig",
                injector_pt: "psig",
                ox_tank_pt: "psig",
            },
            precision: { // Nums past decimal point
                load_cell: 2,
                feed_line_pt: 2,
                cc_pt: 2,
                injector_pt: 2,
                ox_tank_pt: 2,
            }
        }
    }

    updateData(data) {
        this.setState((state) => {
          for (const [key, val] of Object.entries(data)){
            state.data[key] = val;
          }
          return state;
        })
    }

    render() {
        const rows = []
        for (const [key, value] of Object.entries(this.state.data)) {
            rows.push({sensor: key, value: value.toFixed(this.state.precision[key]) + " " + this.state.unit[key]});
        }
        return (<TableContainer component={Paper}>
            <Table aria-label="sensor table">
              <TableHead>
                <TableRow sx={{ 'td, th': { border: 1, fontSize: 30 } }}>
                  <TableCell>Sensor</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.sensor}
                    sx={{ 'td, th': { border: 1, fontSize: 18 } }}
                  >
                    <TableCell component="th" scope="row">{row.sensor}</TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>);
    }
}

export { LiveReadoutTable }