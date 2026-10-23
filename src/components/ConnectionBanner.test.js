import { render, screen, act } from '@testing-library/react';
import { ConnectionBanner } from './ConnectionBanner';

describe('ConnectionBanner', () => {
    test('is hidden while connected', () => {
        const { container } = render(<ConnectionBanner link={{ state: 'connected', attempt: 0 }} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('is hidden when not trying to connect', () => {
        const { container } = render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 3 }} visible={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('shows connection lost with the attempt number', () => {
        render(<ConnectionBanner link={{ state: 'reconnecting', attempt: 3 }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/CONNECTION LOST.*attempt 3/);
    });

    test('shows no data when stale', () => {
        render(<ConnectionBanner link={{ state: 'stale', attempt: 0 }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/NO DATA/);
    });

    test('shows connecting', () => {
        render(<ConnectionBanner link={{ state: 'connecting', attempt: 0 }} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/Connecting/);
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
