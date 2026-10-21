import React from "react";
import Button from '@mui/material/Button';
import { useState, useEffect, useRef } from "react";

// Two-step ignition: ARM -> (ARM_DELAY_MS pause) -> IGNITE -> ignition sent.
// If IGNITE isn't clicked within ARM_TIMEOUT_S seconds, the button goes back to ARM.
// After ignition is sent the button becomes "Abort Ignition", so abort is only
// reachable after both ignition clicks.
const ARM_DELAY_MS = 1000;
const ARM_TIMEOUT_S = 15;
// Ignore clicks this soon after IGNITE so a fast double-click on IGNITE
// can't immediately land on the Abort button that replaces it.
const POST_IGNITE_GUARD_MS = 400;

const IgnitionButton = (props) => {
    const { callback, authenticated = false } = props;
    // idle -> arming -> armed -> ignited -> idle
    const [phase, setPhase] = useState("idle");
    const [secondsLeft, setSecondsLeft] = useState(ARM_TIMEOUT_S);
    const ignitedAt = useRef(0);

    useEffect(() => {
        if (phase === "arming") {
            const timer = setTimeout(() => {
                setSecondsLeft(ARM_TIMEOUT_S);
                setPhase("armed");
            }, ARM_DELAY_MS);
            return () => clearTimeout(timer);
        }
        if (phase === "armed") {
            // The timeout is its own timer; the interval only drives the displayed countdown.
            const timeout = setTimeout(() => setPhase("idle"), ARM_TIMEOUT_S * 1000);
            const ticker = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
            return () => {
                clearTimeout(timeout);
                clearInterval(ticker);
            };
        }
    }, [phase]);

    // Losing authentication (password changed/cleared, connection reset) disarms.
    // Once ignition has been sent, the abort button is left alone.
    useEffect(() => {
        if (!authenticated && (phase === "arming" || phase === "armed")) {
            setPhase("idle");
        }
    }, [authenticated, phase]);

    const handleClick = () => {
        if (phase === "idle") {
            setPhase("arming");
        } else if (phase === "armed") {
            ignitedAt.current = Date.now();
            setPhase("ignited");
            callback(true);
        } else if (phase === "ignited") {
            if (Date.now() - ignitedAt.current < POST_IGNITE_GUARD_MS) {
                return;
            }
            setPhase("idle");
            callback(false);
        }
    };

    const sx = { minWidth: 170 };

    if (phase === "arming") {
        return (
            <Button disabled variant="outlined" color="warning" sx={sx}>
                Arming...
            </Button>
        );
    }
    if (phase === "armed") {
        return (
            <Button disabled={!authenticated} onClick={handleClick} variant="contained" color="error" sx={sx}>
                {`IGNITE (${secondsLeft})`}
            </Button>
        );
    }
    if (phase === "ignited") {
        return (
            <Button disabled={!authenticated} onClick={handleClick} variant="contained" color="warning" sx={sx}>
                Abort Ignition
            </Button>
        );
    }
    return (
        <Button disabled={!authenticated} onClick={handleClick} variant="outlined" color="warning" sx={sx}>
            ARM
        </Button>
    );
};

export { IgnitionButton };
