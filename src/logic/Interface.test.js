import Interface from './Interface';
import { probePi } from './probePi';

jest.mock('./probePi', () => ({ probePi: jest.fn() }));

// Minimal WebSocket stand-in so we can open/close sockets by hand.
class FakeSocket {
    static instances = [];
    static OPEN = 1;
    constructor(url) {
        this.url = url;
        this.readyState = 0;
        this.sent = [];
        FakeSocket.instances.push(this);
    }
    send(data) {
        if (this.readyState !== FakeSocket.OPEN) {
            throw new Error('InvalidStateError');
        }
        this.sent.push(data);
    }
    close() {
        this.readyState = 3;
        this.onclose?.();
    }
    // helpers for the tests
    open() {
        this.readyState = FakeSocket.OPEN;
        this.onopen?.();
    }
    drop() {
        this.readyState = 3;
        this.onclose?.();
    }
}

const config = { engine: 'sphinx', sensor_ids: { drivers: { 0: 'ox_fill' } } };
const last = () => FakeSocket.instances[FakeSocket.instances.length - 1];

// Every Interface made by a test is closed afterwards so no timers leak between tests.
let created = [];
const make = (...args) => {
    const iface = new Interface(...args);
    created.push(iface);
    return iface;
};

// Jest 27 has no advanceTimersByTimeAsync: advance the fake clock, then let pending promises settle.
const advance = async (ms) => {
    jest.advanceTimersByTime(ms);
    for (let i = 0; i < 10; i++) {
        await Promise.resolve();
    }
};

// Advance time while the Pi keeps sending a message every second, so an open socket never goes stale.
const feed = async (ms) => {
    for (let t = 0; t < ms; t += 1000) {
        last().onmessage({ data: JSON.stringify({ console: 'tick' }) });
        await advance(1000);
    }
};

describe('Interface auto-reconnect', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        FakeSocket.instances = [];
        global.WebSocket = FakeSocket;
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        probePi.mockReset();
        probePi.mockResolvedValue({ host: 'up', service: 'silent' });
    });
    afterEach(() => {
        created.forEach((iface) => iface.close());
        created = [];
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    test('reconnects after an unexpected close, with a growing delay', () => {
        make('1.2.3.4:2707', config, jest.fn());
        expect(FakeSocket.instances).toHaveLength(1);

        last().drop();
        jest.advanceTimersByTime(999);
        expect(FakeSocket.instances).toHaveLength(1);
        jest.advanceTimersByTime(1);
        expect(FakeSocket.instances).toHaveLength(2);

        // second failure waits 2 s, then 4 s, then caps at 5 s
        last().drop();
        jest.advanceTimersByTime(1999);
        expect(FakeSocket.instances).toHaveLength(2);
        jest.advanceTimersByTime(1);
        expect(FakeSocket.instances).toHaveLength(3);

        last().drop();
        jest.advanceTimersByTime(4000);
        expect(FakeSocket.instances).toHaveLength(4);

        last().drop();
        jest.advanceTimersByTime(5000);
        expect(FakeSocket.instances).toHaveLength(5);
        last().drop();
        jest.advanceTimersByTime(4999);
        expect(FakeSocket.instances).toHaveLength(5);
        jest.advanceTimersByTime(1);
        expect(FakeSocket.instances).toHaveLength(6);
    });

    test('a successful connection resets the delay', () => {
        make('1.2.3.4:2707', config, jest.fn());
        last().drop();
        jest.advanceTimersByTime(1000);
        last().drop();
        jest.advanceTimersByTime(2000);
        last().open();
        last().drop();
        jest.advanceTimersByTime(1000);
        expect(FakeSocket.instances).toHaveLength(4);
    });

    test('close() stops reconnecting and cancels a pending retry', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        last().open();
        iface.close();
        jest.advanceTimersByTime(30000);
        expect(FakeSocket.instances).toHaveLength(1);

        const iface2 = make('1.2.3.4:2707', config, jest.fn());
        last().drop();
        iface2.close();
        jest.advanceTimersByTime(30000);
        expect(FakeSocket.instances).toHaveLength(2);
    });

    test('commands are sent when open', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        iface.setAuth('pw');
        last().open();
        iface.sendIgnition();
        iface.sendDriverUpdate('ox_fill', true);
        expect(last().sent.map((s) => JSON.parse(s).type)).toEqual(['Ignition', 'Actuate']);
        expect(JSON.parse(last().sent[1])).toEqual({ type: 'Actuate', driver_id: '0', value: true, password: 'pw' });
    });

    test('commands while disconnected are dropped, not thrown and not replayed', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        expect(() => iface.sendIgnition()).not.toThrow(); // still connecting
        last().open();
        last().drop();
        expect(() => iface.sendDriverUpdate('ox_fill', true)).not.toThrow();
        expect(() => iface.sendIgnitionCancel()).not.toThrow();

        jest.advanceTimersByTime(1000);
        last().open();
        expect(last().sent).toEqual([]); // nothing queued from before
    });

    test('reports link status: connecting, connected, reconnecting with attempt count', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        const statuses = [];
        iface.setOnStatus((s) => statuses.push(s));
        expect(statuses).toHaveLength(1);
        expect(statuses[0]).toMatchObject({ state: 'connecting', attempt: 0 });

        last().drop();
        jest.advanceTimersByTime(1000);
        last().drop();
        expect(statuses.slice(1).map(({ state, attempt }) => ({ state, attempt }))).toEqual([
            { state: 'reconnecting', attempt: 1 },
            { state: 'reconnecting', attempt: 2 },
        ]);

        jest.advanceTimersByTime(2000);
        last().open();
        expect(statuses[statuses.length - 1]).toMatchObject({ state: 'connected', attempt: 0 });
        iface.close();
    });

    test('an open socket that goes quiet is reported stale, and recovers on data', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        const statuses = [];
        iface.setOnStatus((s) => statuses.push(s.state));
        last().open();

        jest.advanceTimersByTime(4000);
        expect(statuses[statuses.length - 1]).toBe('connected');
        jest.advanceTimersByTime(2000);
        expect(statuses[statuses.length - 1]).toBe('stale');

        last().onmessage({ data: JSON.stringify({ console: 'hi' }) });
        expect(statuses[statuses.length - 1]).toBe('connected');
        iface.close();
    });

    test('close() stops the stale check', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        const onStatus = jest.fn();
        last().open();
        iface.setOnStatus(onStatus);
        onStatus.mockClear();
        iface.close();
        jest.advanceTimersByTime(60000);
        expect(onStatus).not.toHaveBeenCalled();
    });

    describe('Pi reachability probing', () => {
        test('does not probe while connected', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            last().open();
            await feed(10000);
            expect(probePi).not.toHaveBeenCalled();
            iface.close();
        });

        test('probes if the first connection is stuck', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            const statuses = [];
            iface.setOnStatus((s) => statuses.push(s));
            await advance(2999);
            expect(probePi).not.toHaveBeenCalled();
            await advance(1);
            expect(probePi).toHaveBeenCalledTimes(1);
            expect(statuses[statuses.length - 1].state).toBe('connecting');
            expect(statuses[statuses.length - 1].probe).toEqual({ host: 'up', service: 'silent' });
            iface.close();
        });

        test('a failed first attempt that recovers quickly does not leave probing running', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            last().drop();
            await advance(1000);
            last().open();
            probePi.mockClear();
            await feed(10000);
            expect(probePi).not.toHaveBeenCalled();
            iface.close();
        });

        test('closing during a stuck connection stops the checks', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            iface.close();
            await advance(10000);
            expect(probePi).not.toHaveBeenCalled();
        });

        test('probes the Pi as soon as the link drops, then every 3 s, with the probe result in the status', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            const statuses = [];
            iface.setOnStatus((s) => statuses.push(s));
            last().open();
            last().drop();
            await advance(0);

            expect(probePi).toHaveBeenCalledTimes(1);
            expect(probePi).toHaveBeenCalledWith('1.2.3.4', 2707);
            expect(statuses[statuses.length - 1].state).toBe('reconnecting');
            expect(statuses[statuses.length - 1].probe).toEqual({ host: 'up', service: 'silent' });

            await advance(2999);
            expect(probePi).toHaveBeenCalledTimes(1);
            await advance(1);
            expect(probePi).toHaveBeenCalledTimes(2);
            iface.close();
        });

        test('only one probe is in flight at a time, even across retries', async () => {
            let finish;
            probePi.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
            const iface = make('1.2.3.4:2707', config, jest.fn());
            last().drop();
            await advance(1000);
            last().drop(); // second failed attempt while the first probe is still running
            await advance(2000);
            expect(probePi).toHaveBeenCalledTimes(1);
            finish({ host: 'down', service: 'silent' });
            iface.close();
        });

        test('stops probing and clears the probe result when the link comes back', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            const statuses = [];
            iface.setOnStatus((s) => statuses.push(s));
            last().drop();
            await advance(0);
            expect(probePi).toHaveBeenCalledTimes(1);

            await advance(1000);
            last().open();
            expect(statuses[statuses.length - 1]).toMatchObject({ state: 'connected', probe: null, downSince: null });
            await feed(20000);
            expect(probePi).toHaveBeenCalledTimes(1);
            iface.close();
        });

        test('a probe that finishes after the link recovered is ignored', async () => {
            let finish;
            probePi.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
            const iface = make('1.2.3.4:2707', config, jest.fn());
            const onStatus = jest.fn();
            last().drop();
            await advance(1000);
            last().open();
            iface.setOnStatus(onStatus);
            onStatus.mockClear();
            finish({ host: 'down', service: 'silent' });
            await feed(10000);
            expect(onStatus).not.toHaveBeenCalled();
            expect(probePi).toHaveBeenCalledTimes(1);
            iface.close();
        });

        test('close() stops probing', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            last().drop();
            await advance(0);
            iface.close();
            await advance(20000);
            expect(probePi).toHaveBeenCalledTimes(1);
        });

        test('a stale (open but silent) socket is probed too, and reports downSince and lastDataAt', async () => {
            const iface = make('1.2.3.4:2707', config, jest.fn());
            const statuses = [];
            iface.setOnStatus((s) => statuses.push(s));
            last().open();
            last().onmessage({ data: JSON.stringify({ console: 'hi' }) });
            const dataAt = Date.now();
            await advance(6000);

            expect(probePi).toHaveBeenCalledTimes(1);
            const latest = statuses[statuses.length - 1];
            expect(latest.state).toBe('stale');
            expect(latest.lastDataAt).toBe(dataAt);
            expect(latest.downSince).toBeGreaterThanOrEqual(dataAt + 5000);
            iface.close();
        });
    });

    test('data from the new socket reaches onData after a reconnect', () => {
        const iface = make('1.2.3.4:2707', config, jest.fn());
        const onData = jest.fn();
        iface.setOnData(onData);
        last().open();
        last().drop();
        jest.advanceTimersByTime(1000);
        last().open();
        last().onmessage({ data: JSON.stringify({ console: 'hello' }) });
        expect(onData).toHaveBeenCalledWith({ telemetry: 'hello' });
    });
});
