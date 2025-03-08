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
        this.data_buffer = [];
        this.onData = null;
        this.password = "";
        let [ip, port] = ["", ""];
        try {
            [ip, port] = ip_port.split(":");
            port = parseInt(port);
        } catch (e) {
            console.error("Invalid IP address and/or port: " + ip_port);
            return;
        }

        try {
            this.tcpClient = new WebSocket(`ws://${ip}:${port}`);
        } catch (error) {
            console.error("WebSocket connection failed!! ", error);
            return;
        }

        this.tcpClient.onopen = () => {
            console.log('Connected to the server');
        };

        this.tcpClient.onmessage = (event) => {
            const text = event.data;
            this.data_buffer.push(text);
            if (text == null) {
                return;
            }
            const json_data = JSON.parse(text);
            const new_data = {};
            if (json_data.pts) {
                for (const datum of json_data.pts.readings) {
                    switch (config.sensor_ids.pts[datum.sensor_id]) {
                        case "feed_line_pt":
                            new_data.feed_line_pt = datum.reading;
                            break;
                        case "cc_pt":
                            new_data.cc_pt = datum.reading;
                            break;
                        case "injector_pt":
                            new_data.injector_pt = datum.reading;
                            break;
                        case "ox_tank_pt":
                            new_data.ox_tank_pt = datum.reading;
                            break;
                        default:
                            console.log("Invalid sensor id " + datum.sensor_id)
                            break;
                    }
                }
            }
            if (json_data.lcs) {
                for (const datum of json_data.lcs.readings) {
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
                new_data.drivers = {}
                for ( const datum of json_data.driver.values ) {
                    switch (config.sensor_ids.drivers[String(idx)]) {
                        case "ox_fill":
                            new_data.drivers.ox_fill = datum;
                            break;
                        case "ground_vent":
                            new_data.drivers.ground_vent = datum;
                            break;
                        case "ops_pneumatic":
                            new_data.drivers.ops_pneumatic = datum;
                            break;
                        case "engine_vent":
                            new_data.drivers.engine_vent = datum;
                            break;

                        default:
                            console.log("Invalid sensor id " + datum.sensor_id)
                            break;
                    }
                    idx++;
                }
            }
            if (json_data.console) {
                new_data.telemetry = json_data.console;
            }

            if (this.onData !== null) {
                this.onData(new_data);
            }
        };

        this.tcpClient.onclose = () => {
            console.log('Connection closed');
        };

    }

    startProximaIgnition(){
        //Opens oxfill for one second
        this.sendDriverUpdate("ox_fill", true);
        setTimeout(()=> {
            console.log("Starting Ignition")
            //starts ignition
            this.sendIgnition();
        },1000);

        //closes oxfill valve after 10 seconds
        setTimeout(() => {
            console.log("closing ox fill");
            this.sendDriverUpdate("ox_fill", false)
        }, 11000);

    }
    sendIgnition() {
        this.tcpClient.send(
            JSON.stringify({
                "type": "Ignition",
                "password": this.password
            })
        );
    }

    sendIgnitionCancel() {
        this.tcpClient.send(
            JSON.stringify({
                "type": "CancelIgnition"
            })
        );
    }

    sendDriverUpdate(driver_name, direction) {
        let driver_id = -1;
        for (const [id, name] of Object.entries(config.sensor_ids.drivers)) {
            if (name === driver_name) {
                driver_id = id;
            }
        }
        if (driver_id < 0) {
            console.error("Invalid driver id");
            return;
        }
        this.tcpClient.send(
            JSON.stringify({
                "type": "Actuate",
                "driver_id": driver_id,
                "value": direction,
                "password": this.password
            })
        );
    }

    sendEStop() {
        this.tcpClient.send(JSON.stringify({ "type": "EmergencyStop" }));
    }

    setOnData(func) {
        this.onData = func;
    }

    setAuth(password) {
        this.password = password;
    }

    close() {
        this.tcpClient.close()
    }
}

export default Interface;