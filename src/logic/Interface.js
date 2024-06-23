import { net } from 'net';
import config from "../config.json"

class Interface {
    constructor (ip, port, data_manager) {
        this.tcpClient = new net.Socket();
        this.data_buffer = [];
        this.tcpClient.connect(port, ip);
        this.data_manager = data_manager

        this.tcpClient.on('data', function (text) {
            // We just received some data from the controller.
            // Send that information down the correct pipeline using the emitter.
        
            this.data_buffer.push(text);
            if (text == null) {
                return;
            }
            const json_data = JSON.parse(text);
            const new_data = {};
            if (json_data.pts) {
                for (const datum in json_data.pts) {
                    switch (config.sensor_ids.pts[datum.sensor_id]) {
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
                for (const datum in json_data.lcs) {
                    switch (config.sensor_ids.lcs[datum.sensor_id]) {
                        case "load_cell":
                            new_data.load_cell = datum.reading;
                            break;
                        default:
                            console.log("Invalid sensor id " + datum.sensor_id)
                            break;
                    }
                }
            }
            this.data_manager.addData(new_data);
        });
    }

}

export default Interface;