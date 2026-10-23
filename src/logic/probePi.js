// Checks whether the Pi is reachable while the websocket is down.
// A browser can't send ICMP pings, so this makes two plain HTTP requests and
// looks at how each one fails:
//   - an HTTP reply of any kind ("answered"): something is listening and replied
//   - a fast network error ("refused"): the Pi's OS reset the connection, so the
//     host is up but nothing is listening on that port
//   - no reply before the timeout ("silent"): host unreachable, or something
//     accepted the connection but never answered (e.g. a hung service)

// Nothing on the Pi listens here, so a reachable Pi refuses it immediately.
// (Pick a port that browsers don't block outright.)
const HOST_PROBE_PORT = 2708;
const PROBE_TIMEOUT_MS = 2000;

async function tryFetch(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        // no-cors: we can't read the reply, we only care that one came back.
        await fetch(url, { mode: "no-cors", cache: "no-store", signal: controller.signal });
        return "answered";
    } catch (e) {
        return controller.signal.aborted ? "silent" : "refused";
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Probe the Pi. Never throws.
 * Resolves to {host, service}:
 *   host:    "up" | "down" | "unknown"
 *   service: "answered" | "refused" | "silent" | "unknown"
 * "unknown" means the check can't run (e.g. the dashboard is served over https,
 * where browsers block these plain-http requests).
 */
async function probePi(host, servicePort, options = {}) {
    const {
        timeoutMs = PROBE_TIMEOUT_MS,
        secure = typeof window !== "undefined" && window.location?.protocol === "https:",
    } = options;

    if (secure) {
        return { host: "unknown", service: "unknown" };
    }
    // The browser knows its own network is down; fast errors would otherwise look like "refused".
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
        return { host: "down", service: "silent" };
    }

    const [hostResult, serviceResult] = await Promise.all([
        tryFetch(`http://${host}:${HOST_PROBE_PORT}/`, timeoutMs),
        tryFetch(`http://${host}:${servicePort}/`, timeoutMs),
    ]);

    // Anything other than silence on either port means the Pi's network stack replied.
    const hostUp = hostResult !== "silent" || serviceResult !== "silent";
    return { host: hostUp ? "up" : "down", service: serviceResult };
}

export { probePi, HOST_PROBE_PORT, PROBE_TIMEOUT_MS };
