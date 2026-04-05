import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import proxima_configs from '../configs/proxima_configs.json';
import sphinx_configs from '../configs/sphinx_configs.json';

class LiveReadoutTable extends React.Component {
    constructor(props) {
        super(props);
        this.config = this.getActiveConfig();
        this.sensorKeys = this.getSensorKeys(this.config);

        const defaults = this.buildDefaults(this.sensorKeys);
        this.state = {
            displayMode: "rawData",
            data: defaults.data,
            unit: defaults.unit,
            display_unit: defaults.display_unit,
            precision: defaults.precision,
        };
    }

    getActiveConfig = () => {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("proximamaindisplay")) {
            return proxima_configs;
        }
        return sphinx_configs;
    }

    getSensorKeys = (config) => {
        const sensorGroups = config?.sensor_ids || {};
        const keys = [];
        for (const [group, mappings] of Object.entries(sensorGroups)) {
            if (group === "drivers") {
                continue;
            }
            for (const key of Object.values(mappings || {})) {
                keys.push(key);
            }
        }
        return [...new Set(keys)];
    }

    inferUnit = (sensorKey) => {
        if (sensorKey === "load_cell") {
            return "lbf";
        }
        if (sensorKey.includes("_pt") || sensorKey === "ox_pt" || sensorKey === "ops_pt") {
            return "psig";
        }
    }

    buildDefaults = (sensorKeys) => {
        const data = {};
        const unit = {};
        const display_unit = {};
        const precision = {};

        for (const key of sensorKeys) {
            data[key] = 0.0;
            unit[key] = this.inferUnit(key);
            display_unit[key] = unit[key];
            precision[key] = 2;
        }

        return { data, unit, display_unit, precision };
    }

    update(dataManager) {
      const dataset = dataManager.modifiedDataset;
      if (!dataset || dataset.length === 0) {
        return;
      }

      const newData = dataset[dataset.length - 1];
      const rateOfChangeUnits = {};
      for (const [key, value] of Object.entries(this.state.unit)) {
        rateOfChangeUnits[key] = value ? value + "/s" : "";
      }

      const nextData = {};
      for (const key of this.sensorKeys) {
        nextData[key] = newData[key];
      }

      this.setState({
        displayMode: dataManager.getDisplayMode(),
        data: nextData,
        display_unit: ((dataManager.displayMode === "rateOfChange") ? rateOfChangeUnits : this.state.unit)
      });
    }

    render() {
        const rows = [];
        for (const key of this.sensorKeys) {
          const value = this.state.data[key];
          if (value === undefined || value === null || isNaN(value)) continue;
          const unit = this.state.display_unit[key] ? ` ${this.state.display_unit[key]}` : "";
          rows.push({sensor: key, value: value.toFixed(this.state.precision[key]) + unit});
        }

        return (
          <TableContainer component={Paper}>
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
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
}

export { LiveReadoutTable };
