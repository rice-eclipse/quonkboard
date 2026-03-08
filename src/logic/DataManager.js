// import * as fs from 'fs';
import proxima_config from "../configs/proxima_configs.json";
import sphinx_config from "../configs/sphinx_configs.json";

/**
 * A class that manages data and provides functionality to manipulate and save the data.
 */
class DataManager {
    constructor(engineConfig = proxima_config) {
        this.config = engineConfig;
        this.displayMode = "rawData";
        this.contextDuration = 10;
        this.data = [];
        this.logs = [];
        this.modifiedDataset = this.data;
        this.valve_states = this.buildInitialValveStates();
    }

    buildInitialValveStates() {
        const valves = {};
        const drivers = Object.values(this.config?.sensor_ids?.drivers || {});

        for (const driver of drivers) {
            if (driver === "ignition") {
                continue;
            }
            valves[driver] = false;
        }

        return valves;
    }

    /**
     * Add data to the dataset.
     * @param {Object} data - The data to be added to the dataset.
     */
    addData(data) {
        const sensorData = Object.keys(data).reduce((acc, key) => {
            if (key !== "telemetry") {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        if (Object.keys(sensorData).length !== 0) {
            this.data.push({ ...sensorData, time: new Date(Date.now()) });
            if (this.data.length > this.config.max_data_points) {
                this.data.shift();
            }
            if (this.displayMode === "movingAverage") {
                this.addMovingAverage();
            } else if (this.displayMode === "rateOfChange") {
                this.addRateOfChange();
            }
        }

        if (data.telemetry) {
            this.addLogMessage(data.telemetry);
        }

        if (data.drivers) {
            for (const driver of Object.keys(this.valve_states)) {
                if (driver in data.drivers) {
                    this.valve_states[driver] = data.drivers[driver];
                }
            }
        }

        console.log(window.performance.memory);
    }

    updateDisplayMode(displayMode, contextDuration) {
        this.displayMode = displayMode;
        this.contextDuration = contextDuration;
        if (displayMode === "movingAverage") {
            this.recalculateMovingAverage();
        } else if (displayMode === "rateOfChange") {
            this.recalculateRateOfChange();
        } else if (displayMode === "rawData") {
            this.modifiedDataset = this.data;
        }
    }

    addMovingAverage(data_index = this.data.length - 1) {
        let sum = {};
        let count = {};
        let i = data_index;
        for (let j = i; j >= 0; j--) {
            if (this.data[i].time.getTime() - this.data[j].time.getTime() <= this.contextDuration * 1000) {
                for (const [key, value] of Object.entries(this.data[j])) {
                    if (key === "time") continue;
                    if (sum[key] === undefined) {
                        sum[key] = 0;
                        count[key] = 0;
                    }
                    sum[key] += value;
                    count[key]++;
                }
            } else {
                break;
            }
        }
        for (const key of Object.keys(sum)) {
            sum[key] /= count[key];
        }
        this.modifiedDataset.push({ time: this.data[i].time, ...sum });
        if (this.modifiedDataset.length > this.config.max_data_points) {
            this.modifiedDataset.shift();
        }
    }

    addRateOfChange(data_index = this.data.length - 1) {
        let i = data_index;
        let j = i;
        while (this.data[i].time.getTime() - this.data[j].time.getTime() < this.contextDuration * 1000) {
            j--;
            if (j < 0) break;
        }
        let rate = {};
        for (const [key, value] of Object.entries(this.data[i])) {
            if (key === "time") continue;
            if (j < 0) {
                rate[key] = null;
            } else {
                rate[key] = (value - this.data[j][key]) / ((this.data[i].time.getTime() - this.data[j].time.getTime()) / 1000);
            }
        }
        this.modifiedDataset.push({ time: this.data[i].time, ...rate });
    }

    recalculateMovingAverage() {
        this.modifiedDataset = [];
        for (let i = 0; i < this.data.length; i++) {
            this.addMovingAverage(i);
        }
    }

    recalculateRateOfChange() {
        this.modifiedDataset = [];
        for (let i = 0; i < this.data.length; i++) {
            this.addRateOfChange(i);
        }
    }

    getData() {
        return this.modifiedDataset;
    }

    getDisplayMode() {
        return this.displayMode;
    }

    getLogs() {
        return this.logs;
    }

    addLogMessage(message) {
        this.logs.push({
            createdAt: new Date(Date.now()),
            message: message
        });
    }
}

export default DataManager;
