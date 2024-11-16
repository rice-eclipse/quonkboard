// import * as fs from 'fs';
import config from "../config.json"

/**
 * A class that manages data and provides functionality to manipulate and save the data.
 */
class DataManager {
    constructor() {
        this.displayMode = "rawData";
        this.contextDuration = 10;
        this.data = [];
        this.logs = [];
        this.modifiedDataset = this.data;
        this.valve_states = {
            ox_fill: false,
            ground_vent: false,
            ops_pneumatic: false,
            engine_vent: false
        }
    }

    /**
     * Add data to the dataset.
     * @param {Object} data - The data to be added to the dataset.
     */
    addData(data) {
        // sensor data is all key-value pairs except for where the key is telemetry
        const sensorData = Object.keys(data).reduce((acc, key) => {
            if (key !== "telemetry") {
                acc[key] = data[key];
            }
            return acc;
        }, {});
        if (Object.keys(sensorData).length !== 0) {
            this.data.push({...sensorData, time: new Date(Date.now())});
            if (this.data.length > config.max_data_points) {
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
            if ("ox_fill" in data.drivers) {
                this.valve_states.ox_fill = data.drivers.ox_fill;
            }
            if ("ground_vent" in data.drivers) {
                this.valve_states.ground_vent = data.drivers.ground_vent;
            }
            if ("ops_pneumatic" in data.drivers) {
                this.valve_states.ops_pneumatic = data.drivers.ops_pneumatic;
            }
            if ("engine_vent" in data.drivers) {
                this.valve_states.engine_vent = data.drivers.engine_vent;
            }
        }
        console.log(window.performance.memory);
    }

    /**
     * Update the display mode and context duration. If the display mode is moving average or rate of change, recalculate.
     * @param {string} displayMode - The new display mode.
     * @param {number} contextDuration - The new context duration.
     */
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

    /**
     * Calculate the moving average for the data points in the dataset.
     */
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
        this.modifiedDataset.push({time: this.data[i].time, ...sum });
        if (this.modifiedDataset.length > config.max_data_points) {
            this.modifiedDataset.shift();
        }
    }

    /**
     * Calculate the rate of change for the data points in the dataset.
     */
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
        this.modifiedDataset.push({time: this.data[i].time, ...rate});
    }

    /**
     * Recalculate the moving average for all data points in the dataset when the context duration or display mode changes.
     */
    recalculateMovingAverage() {
        this.modifiedDataset = [];
        for (let i = 0; i < this.data.length; i++) {
            this.addMovingAverage(i);
        }
    }

    /**
     * Recalculate the rate of change for all data points in the dataset when the context duration or display mode changes.
     */
    recalculateRateOfChange() {
        this.modifiedDataset = [];
        for (let i = 0; i < this.data.length; i++) {
            this.addRateOfChange(i);
        }
    }

    // Use for outside access to the data
    getData() {
        return this.modifiedDataset;
    }

    // Use for outside access to the display mode
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

    /**
     * Save the dataset to a CSV file.
     */
    // saveToCsv() {
    //     const csv = this.data.map(row => Object.values(row).join(",")).join("\n");
    //     fs.writeFileSync("data.csv", csv);
    // }
}

export default DataManager