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
            displayMode: "rawData",
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
            display_unit: {
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

    update(dataManager) {
      const newData = dataManager.modifiedDataset[dataManager.modifiedDataset.length - 1];
      const rateOfChangeUnits = {}
      for (const [key, value] of Object.entries(this.state.unit)) {
        rateOfChangeUnits[key] = value + "/s";
      }
      this.setState(
        {
          displayMode: dataManager.getDisplayMode(),
          data: {
            load_cell: newData.load_cell,
            feed_line_pt: newData.feed_line_pt,
            cc_pt: newData.cc_pt,
            injector_pt: newData.injector_pt,
            ox_tank_pt: newData.ox_tank_pt,
          },
          display_unit: ((dataManager.displayMode === "rateOfChange") ? rateOfChangeUnits : this.state.unit)
        }
      );
    }

    render() {
        const rows = [];
        for (const [key, value] of Object.entries(this.state.data)) {
          if (value === undefined || value === null || isNaN(value)) continue;
          rows.push({sensor: key, value: value.toFixed(this.state.precision[key]) + " " + this.state.display_unit[key]});
        }
        return (<TableContainer component={Paper}>
            <Table aria-label="sensor table">
              <TableHead>
                <TableRow sx={{ 'td, th': { border: 1, fontSize: 20 } }}>
                  <TableCell>Sensor</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.sensor}
                    sx={{ 'td, th': { border: 1, fontSize: 16 } }}
                  >
                    <TableCell component="th" scope="row">{row.sensor}</TableCell>
                    <TableCell >{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>);
    }
}

export { LiveReadoutTable }