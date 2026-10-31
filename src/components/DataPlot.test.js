import { createRef } from 'react';
import { render, act } from '@testing-library/react';
import DataPlot from './DataPlot';

const point = (ms) => ({ time: new Date(ms), cc_pt: 0 });
const NOW = Date.UTC(2026, 9, 31, 20, 0, 0);

const setup = () => {
    const plot = createRef();
    const view = render(<DataPlot ref={plot} keys={['cc_pt']} />);
    return { plot, ...view };
};

const send = (plot, data) => act(() => plot.current.update({ modifiedDataset: data }));

describe('DataPlot time window', () => {
    test('an update before any data does not start the window at 1970', () => {
        const { plot, rerender } = setup();
        rerender(<DataPlot ref={plot} keys={['cc_pt']} />);
        expect(plot.current.state.slidervals).toBeNull();

        send(plot, [point(NOW)]);
        send(plot, [point(NOW), point(NOW + 500)]);
        expect(plot.current.state.slidervals).toEqual([NOW, NOW + 500]);
        expect(plot.current.state.sliderrange).toEqual([NOW, NOW + 500]);
    });

    test('the window keeps up as old points are dropped', () => {
        const { plot } = setup();
        send(plot, [point(NOW), point(NOW + 500)]);
        send(plot, [point(NOW + 500), point(NOW + 1000)]);
        expect(plot.current.state.slidervals).toEqual([NOW + 500, NOW + 1000]);
    });
});
