import proxima_config from "../configs/proxima_configs.json";
import { probePi } from "./probePi";

// Reconnect delay doubles after each failed attempt, up to the max.
const RECONNECT_MIN_MS = 1000;
const RECONNECT_MAX_MS = 5000;
// An open socket that delivers nothing for this long is reported as "stale".
const STALE_MS = 5000;
// While the link is down or stale, check whether the Pi answers this often.
const PROBE_INTERVAL_MS = 3000;

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

        this.url = `ws://${ip}:${port}`;
        this.host = ip;
        this.port = port;
        this.closing = false;
        this.retry_delay = RECONNECT_MIN_MS;
        this.retry_timer = null;
        this.link = { state: "connecting", attempt: 0, probe: null, downSince: null, lastDataAt: null };
        this.onStatus = null;
        this.last_message_at = Date.now();
        this.last_data_at = null;
        this.probe_active = false;
        this.probe_token = 0;
        this.probe_timer = null;

        this.handleMessage = (event) => {
            this.last_message_at = Date.now();
            this.last_data_at = this.last_message_at;
            if (this.link.state === "stale") {
                this.setLink("connected");
            }
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

        this.connect();
        this.stale_timer = setInterval(() => this.checkStale(), 1000);
    }

    /**
     * Open the websocket. If it closes unexpectedly, retry with a growing delay
     * until close() is called. Commands are never queued across a reconnect.
     */
    connect() {
        try {
            this.tcpClient = new WebSocket(this.url);
        } catch (error) {
            console.error("WebSocket connection failed!! ", error);
            return;
        }

        this.tcpClient.onopen = () => {
            console.log('Connected to the server');
            this.retry_delay = RECONNECT_MIN_MS;
            this.last_message_at = Date.now();
            this.setLink("connected");
        };

        this.tcpClient.onmessage = this.handleMessage;

        this.tcpClient.onclose = () => {
            console.log('Connection closed');
            if (this.closing) {
                return;
            }
            this.setLink("reconnecting", this.link.attempt + 1);
            console.log(`Reconnecting in ${this.retry_delay} ms`);
            this.retry_timer = setTimeout(() => this.connect(), this.retry_delay);
            this.retry_delay = Math.min(this.retry_delay * 2, RECONNECT_MAX_MS);
        };
    }

    /**
     * Send a command only if the socket is open. Otherwise the command is
     * dropped (never queued) so a stale command can't run after a reconnect.
     */
    send(message) {
        if (this.tcpClient?.readyState !== WebSocket.OPEN) {
            console.error("Not connected - command dropped: " + message.type);
            return false;
        }
        this.tcpClient.send(JSON.stringify(message));
        return true;
    }

    sendIgnition() {
        this.send({
            "type": "Ignition",
            "password": this.password,
            "engine": this.config.engine
        });
    }

    sendIgnitionCancel() {
        this.send({
            "type": "CancelIgnition"
        });
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
        this.send({
            "type": "Actuate",
            "driver_id": driver_id,
            "value": direction,
            "password": this.password
        });
    }

    sendEStop() {
        this.send({ "type": "EmergencyStop" });
    }

    setOnData(func) {
        this.onData = func;
    }

    /**
     * Register a listener for link status. It is called right away with the
     * current status, then on every change. The status is
     * {state, attempt, probe, downSince, lastDataAt}:
     *   state:      "connecting" | "connected" | "reconnecting" | "stale"
     *   probe:      null until the first Pi reachability check finishes, then
     *               {host, service} from probePi (only checked while down/stale)
     *   downSince:  ms timestamp the link went down or stale, else null
     *   lastDataAt: ms timestamp of the last message received, else null
     */
    setOnStatus(func) {
        this.onStatus = func;
        func?.({ ...this.link });
    }

    setLink(state, attempt = 0) {
        const isDown = (s) => s === "reconnecting" || s === "stale";
        const down = isDown(state);
        const wasDown = isDown(this.link.state);
        this.link = {
            state,
            attempt,
            // keep the last probe result across retries, reset when the state flips
            probe: down && wasDown ? this.link.probe : null,
            downSince: down ? (wasDown ? this.link.downSince : Date.now()) : null,
            lastDataAt: this.last_data_at,
        };
        if (down) {
            this.startProbing();
        } else {
            this.stopProbing();
        }
        this.onStatus?.({ ...this.link });
    }

    /** Check whether the Pi answers, repeatedly, until stopProbing(). One check at a time. */
    startProbing() {
        if (this.probe_active) {
            return;
        }
        this.probe_active = true;
        const token = ++this.probe_token;
        const run = async () => {
            const result = await probePi(this.host, this.port);
            if (token !== this.probe_token) {
                return; // stopped (or restarted) while this check was running
            }
            this.link = { ...this.link, probe: result };
            this.onStatus?.({ ...this.link });
            this.probe_timer = setTimeout(run, PROBE_INTERVAL_MS);
        };
        run();
    }

    stopProbing() {
        this.probe_active = false;
        this.probe_token++;
        clearTimeout(this.probe_timer);
    }

    checkStale() {
        if (this.link.state === "connected" && Date.now() - this.last_message_at > STALE_MS) {
            this.setLink("stale");
        }
    }

    setAuth(password) {
        this.password = password;
    }

    close() {
        this.closing = true;
        clearTimeout(this.retry_timer);
        clearInterval(this.stale_timer);
        this.stopProbing();
        this.tcpClient?.close();
    }
}

export default Interface;
