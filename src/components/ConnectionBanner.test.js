import { render, screen, act } from '@testing-library/react';
import { ConnectionBanner, STATUS_SLOT_ID } from './ConnectionBanner';

describe('ConnectionBanner', () => {
    test('is hidden while connected', () => {
        const { container } = render(<ConnectionBanner link={{ state: 'connected', attempt: 0 }} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('is hidden when not trying to connect', () => {
        const { container } = render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 3 }} visible={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('shows in the top bar slot, not in the page', () => {
        const slot = document.createElement('div');
        slot.id = STATUS_SLOT_ID;
        document.body.appendChild(slot);
        try {
            const { container } = render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 3 }} />);
            expect(slot).toContainElement(screen.getByRole('alert'));
            expect(container).toBeEmptyDOMElement();
        } finally {
            slot.remove();
        }
    });

    test('shows connection lost with the attempt number once there has been data', () => {
        render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 3, lastDataAt: Date.now() }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/CONNECTION LOST.*attempt 3.*out of date/);
    });

    test('a connection that never worked is not called lost', () => {
        render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 1, lastDataAt: null }} />);
        const banner = screen.getByRole('alert');
        expect(banner).toHaveTextContent(/CAN'T CONNECT.*attempt 1/);
        expect(banner).not.toHaveTextContent(/CONNECTION LOST/);
        expect(banner).not.toHaveTextContent(/out of date/);
    });

    test('does not claim commands are disabled', () => {
        render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 1, lastDataAt: Date.now() }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/commands won't go through/);
    });

    test('shows no data when stale, without claiming to be connected', () => {
        render(<ConnectionBanner link={{ state: 'stale', attempt: 0 }} />);
        const banner = screen.getByRole('alert');
        expect(banner).toHaveTextContent(/NO DATA/);
        expect(banner).toHaveTextContent(/commands may not go through/);
        expect(banner).not.toHaveTextContent(/connected/);
    });

    test('shows connecting', () => {
        render(<ConnectionBanner link={{ state: 'connecting', attempt: 0 }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/^Connecting\.\.\.$/);
    });

    test('explains a connection attempt that is stuck', () => {
        render(<ConnectionBanner link={{ state: 'connecting', attempt: 0, probe: { host: 'down', service: 'silent' } }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/Connecting.*Pi is not responding/);
    });

    describe('connected to the sim', () => {
        const simDown = (probe) => ({ state: 'reconnecting', attempt: 1, probe, lastDataAt: Date.now() });

        test.each(['127.0.0.1:2707', 'localhost:2707'])('%s is the sim, not the Pi', (ip) => {
            render(<ConnectionBanner ip={ip} link={simDown({ host: 'up', service: 'refused' })} />);
            expect(screen.getByRole('alert')).toHaveTextContent(/The sim isn't running/);
            expect(screen.getByRole('alert')).not.toHaveTextContent(/Pi/);
        });

        test('says it is checking the sim', () => {
            render(<ConnectionBanner ip="127.0.0.1:2707" link={simDown(null)} />);
            expect(screen.getByRole('alert')).toHaveTextContent(/Checking the sim/);
        });

        test('frozen sim', () => {
            render(<ConnectionBanner ip="127.0.0.1:2707" link={simDown({ host: 'up', service: 'silent' })} />);
            expect(screen.getByRole('alert')).toHaveTextContent(/likely frozen/);
        });

        test('the Pi address still talks about the Pi', () => {
            render(<ConnectionBanner ip="192.168.0.100:2707" link={simDown({ host: 'up', service: 'refused' })} />);
            expect(screen.getByRole('alert')).toHaveTextContent(/labjack service isn't listening/);
        });
    });

    const down = (probe) => ({ state: 'reconnecting', attempt: 2, probe, downSince: null, lastDataAt: null });

    test('says it is checking until the first probe result arrives', () => {
        render(<ConnectionBanner link={down(null)} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/Checking whether the Pi is reachable/);
    });

    test('Pi unreachable', () => {
        render(<ConnectionBanner link={down({ host: 'down', service: 'silent' })} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/Pi is not responding to network checks/);
    });

    test('Pi up but the service is not listening', () => {
        render(<ConnectionBanner link={down({ host: 'up', service: 'refused' })} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/service isn't listening/);
    });

    test('Pi up but the service is silent (hung)', () => {
        render(<ConnectionBanner link={down({ host: 'up', service: 'silent' })} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/likely hung/);
    });

    test('Pi up and the service answering', () => {
        render(<ConnectionBanner link={down({ host: 'up', service: 'answered' })} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/service is answering/);
    });

    test('adds no reachability line when the check cannot run', () => {
        render(<ConnectionBanner link={down({ host: 'unknown', service: 'unknown' })} />);
        expect(screen.getByRole('alert')).not.toHaveTextContent(/Pi is/);
    });

    test('shows last data and down time, and counts up each second', () => {
        jest.useFakeTimers();
        try {
            const t0 = Date.now();
            const link = { state: 'stale', attempt: 0, probe: null, downSince: t0, lastDataAt: t0 - 5000 };
            render(<ConnectionBanner link={link} />);
            expect(screen.getByRole('alert')).toHaveTextContent(/last data 5 s ago, down for 0 s/);
            act(() => { jest.advanceTimersByTime(3000); });
            expect(screen.getByRole('alert')).toHaveTextContent(/last data 8 s ago, down for 3 s/);
        } finally {
            jest.useRealTimers();
        }
    });
});
