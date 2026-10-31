/**
 * Move a plot's visible time window after the data's time range grows to [min_time, max_time].
 * A window ending at the old range end keeps following the newest data. The dataset drops its
 * oldest points, so the window is also kept from starting before the data does.
 */
function followData(slidervals, sliderrange, min_time, max_time, constantTimeDelta) {
    const next = [...slidervals];
    if (slidervals[1] === sliderrange[1]) {
        if (constantTimeDelta) {
            next[0] += max_time - sliderrange[1];
        }
        next[1] = max_time;
    }
    next[0] = Math.max(next[0], min_time);
    next[1] = Math.max(next[1], next[0]);
    return next;
}

export { followData };
