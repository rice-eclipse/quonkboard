// import * as fs from 'fs';
/**
 * A class that manages data and provides functionality to manipulate and save the data.
 */
class DataManager {
    constructor() {
        this.displayMode = "rawData";
        this.contextLength = 10;
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
     * Update the display mode and context length. If the display mode is moving average or rate of change, recalculate.
     * @param {string} displayMode - The new display mode.
     * @param {number} contextLength - The new context length.
     */
    updateDisplayMode(displayMode, contextLength) {
        this.displayMode = displayMode;
        this.contextLength = contextLength;
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
    addMovingAverage() {
        const movingAverage = [];
        for (let i = 0; i < this.data.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = i; j >= 0; j--) {
                if (this.data[i].time - this.data[j].time <= this.contextLength * 1000) {
                    sum += this.data[j].data;
                    count++;
                } else {
                    break;
                }
            }
            movingAverage.push({time: this.data[i].time, data: sum / count});
        }
        this.modifiedDataset = movingAverage;
    }

    /**
     * Calculate the rate of change for the data points in the dataset.
     */
    addRateOfChange() {
        const rateOfChange = [];
        for (let i = 0; i < this.data.length; i++) {
            let rate = 0;
            for (let j = i; j >= 0; j--) {
                if (this.data[i].time - this.data[j].time <= this.contextLength * 1000) {
                    rate = (this.data[i].data - this.data[j].data) / (this.data[i].time - this.data[j].time);
                    break;
                }
            }
            rateOfChange.push({time: this.data[i].time, data: rate});
        }
        this.modifiedDataset = rateOfChange;
    }

    /**
     * Recalculate the moving average for all data points in the dataset when the context length or display mode changes.
     */
    recalculateMovingAverage() {
        this.modifiedDataset = [];
        for (const data_point of this.data) {
            this.addMovingAverage(data_point);
        }
    }

    /**
     * Recalculate the rate of change for all data points in the dataset when the context length or display mode changes.
     */
    recalculateRateOfChange() {
        this.modifiedDataset = [];
        for (const data_point of this.data) {
            this.addRateOfChange(data_point);
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