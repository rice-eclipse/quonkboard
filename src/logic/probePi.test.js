import { probePi } from './probePi';

// fetch stand-in: each URL maps to 'answered', 'refused' (fast network error) or 'silent' (never replies).
const mockFetch = (behaviour) => {
    global.fetch = jest.fn((url, { signal }) => {
        const result = behaviour[new URL(url).port];
        if (result === 'answered') {
            return Promise.resolve({});
        }
        if (result === 'refused') {
            return Promise.reject(new TypeError('Failed to fetch'));
        }
        return new Promise((_, reject) => {
            signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        });
    });
};

// Jest 27 has no advanceTimersByTimeAsync: advance the fake clock, then let pending promises settle.
const advance = async (ms) => {
    jest.advanceTimersByTime(ms);
    for (let i = 0; i < 10; i++) {
        await Promise.resolve();
    }
};

// Run probePi with fake timers: start it, let the 2 s timeout elapse, then collect the result.
// Pending promises are flushed first: a refused or answered fetch settles immediately, long
// before the timeout, so it must not be overtaken by the timer firing.
const run = async (options) => {
    const promise = probePi('192.168.0.100', 2707, options);
    await advance(0);
    await advance(2500);
    return promise;
};

describe('probePi', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.useRealTimers();
        delete global.fetch;
    });

    test('service answering -> host up, service answered', async () => {
        mockFetch({ 2707: 'answered', 2708: 'refused' });
        expect(await run()).toEqual({ host: 'up', service: 'answered' });
    });

    test('service port refused fast -> host up, service refused', async () => {
        mockFetch({ 2707: 'refused', 2708: 'refused' });
        expect(await run()).toEqual({ host: 'up', service: 'refused' });
    });

    test('host answers but the service is silent -> host up, service silent (hung)', async () => {
        mockFetch({ 2707: 'silent', 2708: 'refused' });
        expect(await run()).toEqual({ host: 'up', service: 'silent' });
    });

    test('everything silent -> host down', async () => {
        mockFetch({ 2707: 'silent', 2708: 'silent' });
        expect(await run()).toEqual({ host: 'down', service: 'silent' });
    });

    test('probes the right urls, with no-cors', async () => {
        mockFetch({ 2707: 'answered', 2708: 'refused' });
        await run();
        const urls = global.fetch.mock.calls.map((c) => c[0]).sort();
        expect(urls).toEqual(['http://192.168.0.100:2707/', 'http://192.168.0.100:2708/']);
        expect(global.fetch.mock.calls[0][1].mode).toBe('no-cors');
    });

    test('does nothing over https (browser would block the requests)', async () => {
        mockFetch({});
        expect(await run({ secure: true })).toEqual({ host: 'unknown', service: 'unknown' });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('browser offline -> host down without probing', async () => {
        mockFetch({});
        const original = Object.getOwnPropertyDescriptor(window.navigator.__proto__, 'onLine');
        Object.defineProperty(window.navigator.__proto__, 'onLine', { configurable: true, get: () => false });
        try {
            expect(await run()).toEqual({ host: 'down', service: 'silent' });
            expect(global.fetch).not.toHaveBeenCalled();
        } finally {
            Object.defineProperty(window.navigator.__proto__, 'onLine', original);
        }
    });
});
