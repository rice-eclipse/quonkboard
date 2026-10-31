import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Alert from "@mui/material/Alert";

// What the reachability check says, depending on what the dashboard is connected to.
const PROBE_TEXT = {
    pi: {
        checking: "Checking whether the Pi is reachable...",
        down: "Pi is not responding to network checks - check the cable, power and network.",
        refused: "Pi is reachable, but the labjack service isn't listening (restarting or stopped?).",
        silent: "Pi is reachable and accepts connections, but the labjack service isn't responding (likely hung).",
        answered: "Pi is reachable and the labjack service is answering.",
    },
    sim: {
        checking: "Checking the sim...",
        down: "The sim isn't responding.",
        refused: "The sim isn't running.",
        silent: "The sim accepts connections but isn't responding (likely frozen).",
        answered: "The sim is answering.",
    },
};

// The banner shows in this slot in the top bar. The bar has a fixed height, so the banner can't
// move the page. The slot ends at the connection controls, and if it's narrow the banner grows
// left over the title, which matters less than the message during an outage.
const STATUS_SLOT_ID = "connection-status-slot";

const COMPACT = {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "max(100%, 520px)",
    maxHeight: 74,
    overflowY: "auto",
    py: 0,
    fontSize: 12,
    lineHeight: 1.3,
    "& .MuiAlert-icon": { fontSize: 18, py: "6px" },
    "& .MuiAlert-message": { py: "5px" },
};

const inStatusSlot = (banner) => {
    const slot = document.getElementById(STATUS_SLOT_ID);
    return slot ? createPortal(banner, slot) : banner;
};

const isThisComputer = (ip = "") => ip.startsWith("127.") || ip.startsWith("localhost");

// probe is {host, service} from probePi, or null if the first check hasn't finished yet.
const describeProbe = (probe, target = "pi") => {
    const text = PROBE_TEXT[target];
    if (!probe) {
        return text.checking;
    }
    if (probe.host === "unknown") {
        return null; // can't check from here (e.g. dashboard served over https)
    }
    if (probe.host === "down") {
        return text.down;
    }
    if (probe.service === "refused") {
        return text.refused;
    }
    if (probe.service === "silent") {
        return text.silent;
    }
    return text.answered;
};

const secondsSince = (timestamp, now) => Math.max(0, Math.round((now - timestamp) / 1000));

/**
 * Shows the link status to the Pi or sim. Hidden while everything is fine.
 * link: {state, attempt, probe, downSince, lastDataAt} from Interface.setOnStatus;
 * ip: the address being connected to;
 * visible: false when not connecting at all.
 */
const ConnectionBanner = (props) => {
    const { link, ip, visible = true } = props;
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

    const target = isThisComputer(ip) ? "sim" : "pi";

    if (link.state === "connecting") {
        // The check only starts if connecting takes a while, so there may be nothing to add.
        const probeText = link.probe ? describeProbe(link.probe, target) : null;
        return inStatusSlot(
            <Alert severity="info" variant="filled" sx={COMPACT}>
                Connecting...
                {probeText && <><br />{probeText}</>}
            </Alert>
        );
    }

    const probeText = describeProbe(link.probe, target);
    const timing = [];
    if (link.lastDataAt) {
        timing.push(`last data ${secondsSince(link.lastDataAt, now)} s ago`);
    }
    if (link.downSince) {
        timing.push(`down for ${secondsSince(link.downSince, now)} s`);
    }
    const details = [probeText, timing.length ? `(${timing.join(", ")})` : null].filter(Boolean).join(" ");

    if (link.state === "reconnecting") {
        const headline = link.lastDataAt
            ? `CONNECTION LOST - retrying (attempt ${link.attempt}). Values are out of date and commands won't go through.`
            : `CAN'T CONNECT - retrying (attempt ${link.attempt}). Commands won't go through.`;
        return inStatusSlot(
            <Alert severity="error" variant="filled" sx={COMPACT}>
                {headline}
                {details && <><br />{details}</>}
            </Alert>
        );
    }
    return inStatusSlot(
        <Alert severity="warning" variant="filled" sx={COMPACT}>
            NO DATA for over 5 seconds. Values are out of date and commands may not go through.
            {details && <><br />{details}</>}
        </Alert>
    );
};

export { ConnectionBanner, describeProbe, STATUS_SLOT_ID };
