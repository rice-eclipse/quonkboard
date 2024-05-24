// import * as fs from 'fs';
/**
 * A class that manages data and provides functionality to manipulate and save the data.
 */
class DataManager {
    constructor() {
        this.displayMode = "rawData";
        this.contextDuration = 10;
        this.data = [];
        this.modifiedDataset = this.data;
    }

    /**
     * Add data to the dataset.
     * @param {Object} data - The data to be added to the dataset.
     */
    addData(data) {
        this.data.push({...data, time: new Date(Date.now())});
        console.log("data", this.data);
        if (this.displayMode === "movingAverage") {
            this.addMovingAverage();
        } else if (this.displayMode === "rateOfChange") {
            this.addRateOfChange();
        }
        console.log("modified", this.modifiedDataset);
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
        console.log("GET DATA", this.modifiedDataset);
        return this.modifiedDataset;
    }

    // Use for outside access to the display mode
    getDisplayMode() {
        return this.displayMode;
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