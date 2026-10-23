import React, { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";

// What the Pi reachability check says. probe is {host, service} from probePi,
// or null if the first check hasn't finished yet.
const describeProbe = (probe) => {
    if (!probe) {
        return "Checking whether the Pi is reachable...";
    }
    if (probe.host === "unknown") {
        return null; // can't check from here (e.g. dashboard served over https)
    }
    if (probe.host === "down") {
        return "Pi is not responding to network checks - check the cable, power and network.";
    }
    if (probe.service === "refused") {
        return "Pi is reachable, but the labjack service isn't listening (restarting or stopped?).";
    }
    if (probe.service === "silent") {
        return "Pi is reachable and accepts connections, but the labjack service isn't responding (likely hung).";
    }
    return "Pi is reachable and the labjack service is answering.";
};

const secondsSince = (timestamp, now) => Math.max(0, Math.round((now - timestamp) / 1000));

/**
 * Shows the link status to the Pi. Hidden while everything is fine.
 * link: {state, attempt, probe, downSince, lastDataAt} from Interface.setOnStatus;
 * visible: false when not connecting at all.
 */
const ConnectionBanner = (props) => {
    const { link, visible = true } = props;
    const [now, setNow] = useState(Date.now());

    const active = visible && !!link && link.state !== "connected";
    // Tick once a second so the "N s ago" text counts up while the banner is showing.
    useEffect(() => {
        if (!active) {
            return;
        }
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [active]);

    if (!active) {
        return null;
    }

    if (link.state === "connecting") {
        return (
            <Alert severity="info" variant="filled" sx={{ mb: 1 }}>
                Connecting...
            </Alert>
        );
    }

    const probeText = describeProbe(link.probe);
    const timing = [];
    if (link.lastDataAt) {
        timing.push(`last data ${secondsSince(link.lastDataAt, now)} s ago`);
    }
    if (link.downSince) {
        timing.push(`down for ${secondsSince(link.downSince, now)} s`);
    }
    const details = [probeText, timing.length ? `(${timing.join(", ")})` : null].filter(Boolean).join(" ");

    if (link.state === "reconnecting") {
        return (
            <Alert severity="error" variant="filled" sx={{ mb: 1 }}>
                {`CONNECTION LOST - retrying (attempt ${link.attempt}). Commands are disabled; the values on screen are out of date.`}
                {details && <><br />{details}</>}
            </Alert>
        );
    }
    return (
        <Alert severity="warning" variant="filled" sx={{ mb: 1 }}>
            NO DATA - connected, but nothing received for over 5 seconds. The values on screen are out of date.
            {details && <><br />{details}</>}
        </Alert>
    );
};

export { ConnectionBanner, describeProbe };
