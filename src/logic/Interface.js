import proxima_config from "../configs/proxima_configs.json";

/**
 * Interface class
 */
class Interface {
    constructor(ip_port, engineConfig = proxima_config, setConnection) {
        this.config = engineConfig;
        this.data_buffer = [];
        this.onData = null;
        this.password = "";
        this.setConnection = setConnection;

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

            if (json_data.pts?.readings) {
                for (const datum of json_data.pts.readings) {
                    const sensorKey = this.config?.sensor_ids?.pts?.[String(datum.sensor_id)];
                    if (sensorKey) {
                        new_data[sensorKey] = datum.reading;
                    }
                }
            }

            if (json_data.lcs?.readings) {
                for (const datum of json_data.lcs.readings) {
                    const sensorKey = this.config?.sensor_ids?.lcs?.[String(datum.sensor_id)];
                    if (sensorKey) {
                        new_data[sensorKey] = datum.reading;
                    }
                }
            }

            if (json_data.rtds?.readings) {
                for (const datum of json_data.rtds.readings) {
                    const sensorKey = this.config?.sensor_ids?.rtds?.[String(datum.sensor_id)];
                    if (sensorKey) {
                        new_data[sensorKey] = datum.reading;
                    }
                }
            }

            if (json_data.driver?.values) {
                new_data.drivers = {};
                for (let idx = 0; idx < json_data.driver.values.length; idx++) {
                    const driverKey = this.config?.sensor_ids?.drivers?.[String(idx)];
                    if (driverKey) {
                        new_data.drivers[driverKey] = json_data.driver.values[idx];
                    }
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
            this.setConnection({ip: "", engineType: ""});
        };
    }

    sendIgnition() {
        this.tcpClient.send(
            JSON.stringify({
                "type": "Ignition",
                "password": this.password,
                "engine": this.config.engine
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
        for (const [id, name] of Object.entries(this.config?.sensor_ids?.drivers || {})) {
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
        this.tcpClient.close();
    }
}

export default Interface;
