import { render, screen, fireEvent } from '@testing-library/react';
import ConnectBar, { PI_ADDRESS, SIM_ADDRESS } from './ConnectBar';

const disconnected = { ip: '', engineType: '' };
const connectedTo = (ip) => ({ ip, engineType: 'prometheus' });

const setup = (connection = disconnected) => {
    const setConnection = jest.fn();
    render(<ConnectBar setConnection={setConnection} connection={connection} engineType="prometheus" />);
    return setConnection;
};

const addressBox = () => screen.getByLabelText('Connection IP');
const button = (name) => screen.getByRole('button', { name });

describe('ConnectBar', () => {
    test('defaults to the Pi', () => {
        setup();
        expect(addressBox()).toHaveValue(PI_ADDRESS);
    });

    test('Sim fills in the sim address without connecting', () => {
        const setConnection = setup();
        fireEvent.click(button('Sim'));
        expect(addressBox()).toHaveValue(SIM_ADDRESS);
        expect(setConnection).not.toHaveBeenCalled();
    });

    test('Pi puts the Pi address back', () => {
        setup();
        fireEvent.click(button('Sim'));
        fireEvent.click(button('Pi'));
        expect(addressBox()).toHaveValue(PI_ADDRESS);
    });

    test('Connect uses the filled in address', () => {
        const setConnection = setup();
        fireEvent.click(button('Sim'));
        fireEvent.click(button('Connect'));
        expect(setConnection).toHaveBeenCalledWith({ ip: SIM_ADDRESS, engineType: 'prometheus' });
    });

    test('a typed address still works', () => {
        const setConnection = setup();
        fireEvent.change(addressBox(), { target: { value: '10.0.0.5:2707' } });
        fireEvent.click(button('Connect'));
        expect(setConnection).toHaveBeenCalledWith({ ip: '10.0.0.5:2707', engineType: 'prometheus' });
    });

    test('Disconnect clears the connection', () => {
        const setConnection = setup(connectedTo(SIM_ADDRESS));
        fireEvent.click(button('Disconnect'));
        expect(setConnection).toHaveBeenCalledWith(disconnected);
    });

    test('the address is locked while connected', () => {
        setup(connectedTo(PI_ADDRESS));
        expect(addressBox()).toBeDisabled();
        expect(button('Pi')).toBeDisabled();
        expect(button('Sim')).toBeDisabled();
    });

    test('shows the live address if it remounts while connected', () => {
        setup(connectedTo(SIM_ADDRESS));
        expect(addressBox()).toHaveValue(SIM_ADDRESS);
    });
});
