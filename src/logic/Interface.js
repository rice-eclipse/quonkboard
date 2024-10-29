import config from "../config.json"

/**
 * Interface class
 * make class documentation
 * 
 * @class
 * @param {string} ip_port - The IP address and port of the controller.
 * @param {DataManager} data_manager - The data manager to send data to.
 * @returns {Interface} The Interface object.
 * @throws {Error} Throws an error if the IP address and/or port is invalid.
 * 
 */
class Interface {
    /**
     * Creates an instance of Interface.
     * 
     * @constructor
     * @param {string} ip_port - The IP address and port in the format "ip:port".
     * @param {Object} data_manager - The data manager object responsible for handling data.
     * 
     * @property {Socket} tcpClient - The TCP client socket.
     * @property {Array} data_buffer - Buffer to store incoming data.
     * @property {Object} data_manager - The data manager object.
     * 
     * @throws Will throw an error if the IP address and/or port is invalid.
     */
    constructor (ip_port) {
        console.log("CREATED INTERFACE " + ip_port);
        this.data_buffer = [];
        this.onData = null;
        let [ip, port] = ["", ""];
        try {
            [ip, port] = ip_port.split(":");
            port = parseInt(port);
        } catch (e) {
            console.error("Invalid IP address and/or port: " + ip_port);
            return;
        }

        try {
            console.log("IP", `ws://${ip}:${port}`);
            this.tcpClient = new WebSocket(`ws://${ip}:${port}`);
        } catch (error) {
            console.error("WebSocket connection failed!! ", error);
            return;
        }
        console.log(this.tcpClient.readyState);

        this.tcpClient.onopen = () => {
            console.log('Connected to the server');
        };

        this.tcpClient.onmessage = (event) => {
            const text = event.data;
            console.log(text);
            this.data_buffer.push(text);
            if (text == null) {
                return;
            }
            const json_data = JSON.parse(text);
            const new_data = {};
            if (json_data.pts) {
                for (const datum in json_data.pts.readings) {
                    switch (config.sensor_ids.pts[String(datum.sensor_id)]) {
                        case "feed_line":
                            new_data.feed_line_pt = datum.reading;
                            break;
                        case "cc":
                            new_data.cc_pt = datum.reading;
                            break;
                        case "injector":
                            new_data.injector_pt = datum.reading;
                            break;
                        case "ox_tank":
                            new_data.ox_tank_pt = datum.reading;
                            break;
                        default:
                            console.log("Invalid sensor id " + datum.sensor_id)
                            break;
                    }
                }
            }
            if (json_data.lcs) {
                for (const datum in json_data.lcs.readings) {
                    switch (config.sensor_ids.lcs[String(datum.sensor_id)]) {
                        case "load_cell":
                            new_data.load_cell = datum.reading;
                            break;
                        default:
                            console.log("Invalid sensor id " + datum.sensor_id)
                            break;
                    }
                }
            }
            if (json_data.driver && json_data.driver.values) {
                let idx = 0;
                for ( const datum in json_data.driver.values ) {
                    switch (config.sensor_ids.drivers[String(idx)]) {
                        default:
                            console.log("Invalid sensor id " + datum.sensor_id)
                            break;
                    }
                    idx++;
                }
            }

            if (this.onData !== null) {
                this.onData(new_data);
            }
        };

        this.tcpClient.onclose = () => {
            console.log('Connection closed');
        };

    }

    setOnData(func) {
        this.onData = func;
    }

    close() {
        this.tcpClient.close()
    }
}

export default Interface;