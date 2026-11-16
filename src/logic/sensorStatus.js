// An unplugged 4-20 mA PT draws no current, so its shunt reads ~0 V and the
// calibrated value lands far below zero (around -250 psig). Anything under this
// threshold is treated as a disconnected sensor rather than a real pressure.
const DEFAULT_PT_DISCONNECTED_BELOW = -150;

/**
 * Whether a raw PT reading means the transducer is disconnected.
 * @param {Object} config - Engine config (e.g. prometheus_configs.json).
 * @param {string} sensorKey - Sensor name, e.g. "cc_pt".
 * @param {number} rawValue - Raw (not averaged / rate-of-change) reading.
 */
function isPtDisconnected(config, sensorKey, rawValue) {
    const pts = Object.values(config?.sensor_ids?.pts || {});
    if (!pts.includes(sensorKey)) {
        return false;
    }
    if (typeof rawValue !== "number" || isNaN(rawValue)) {
        return false;
    }
    const threshold = config?.pt_disconnected_below ?? DEFAULT_PT_DISCONNECTED_BELOW;
    return rawValue < threshold;
}

/**
 * Latest raw reading for every sensor, from the data manager's unmodified dataset.
 */
function latestRawReadings(dataManager) {
    const raw = dataManager?.data;
    if (!raw || raw.length === 0) {
        return {};
    }
    return raw[raw.length - 1];
}

export { isPtDisconnected, latestRawReadings, DEFAULT_PT_DISCONNECTED_BELOW };
