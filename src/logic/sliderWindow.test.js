import { followData } from './sliderWindow';

describe('followData', () => {
    test('a window at the live edge follows new data', () => {
        expect(followData([100, 200], [100, 200], 100, 250, false)).toEqual([100, 250]);
    });

    test('a window moved back from the live edge stays put', () => {
        expect(followData([120, 180], [100, 200], 100, 250, false)).toEqual([120, 180]);
    });

    test('preserve timespan slides the whole window', () => {
        expect(followData([150, 200], [100, 200], 100, 250, true)).toEqual([200, 250]);
    });

    test('preserve timespan leaves a window behind the live edge alone', () => {
        expect(followData([120, 180], [100, 200], 100, 250, true)).toEqual([120, 180]);
    });

    test('the window starts no earlier than the oldest data', () => {
        expect(followData([100, 200], [100, 200], 130, 250, false)).toEqual([130, 250]);
    });

    test('a window older than all the data moves up to it', () => {
        expect(followData([100, 120], [100, 200], 150, 250, false)).toEqual([150, 150]);
    });
});
