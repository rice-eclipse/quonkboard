# QuonkBoard Commands

A short reference of commands for running the dashboard and looking after the labjack Raspberry Pi. Lines that start with `#` inside a code block are comments, not part of the command.

Commands marked **(on the Pi)** are typed into an SSH session on the Pi. The rest run on your own computer.

## Connection Details

| What | Value |
|------|-------|
| Pi address | `192.168.0.100` |
| Pi user | `eclipsepi` |
| Labjack websocket | `192.168.0.100:2707` |
| Dashboard (development) | `http://localhost:3000` |
| Labjack service name | `labjack` (a systemd **user** service) |
| Quonkboard service name | `quonkboard` (a systemd **user** service, see Deployment in the [README](README.md)) |

The Pi's login password is in `handover_notes.md` in the labjack repo.

## Checking the Pi is Reachable

```bash
# Windows (PowerShell) - four replies means the Pi is on the network
ping 192.168.0.100

# Windows (PowerShell) - keep pinging until you press Ctrl + C
ping -t 192.168.0.100

# Windows (PowerShell) - is the labjack websocket port accepting connections?
Test-NetConnection 192.168.0.100 -Port 2707

# Linux / macOS
ping -c 4 192.168.0.100
nc -zv 192.168.0.100 2707
```

Reading the results:
- **Ping works and port 2707 connects:** the Pi and the labjack service are both up. If the dashboard still shows no data, the service may be hung, so see [When the Dashboard Stops Responding](#when-the-dashboard-stops-responding).
- **Ping works but port 2707 fails:** the Pi is up but the labjack service is stopped, restarting or hung.
- **Ping fails:** check the ethernet cable, the Pi's power and your computer's `192.168.0.x` address (see Usage in the [README](README.md)).

The dashboard banner runs a similar check by itself while the connection is down.

## Connecting to the Pi

```bash
ssh eclipsepi@192.168.0.100
```

In MobaXterm, use Session > SSH with remote host `192.168.0.100` and username `eclipsepi`. Its left sidebar is also a file browser for the Pi.

On a Linux laptop that uses a USB ethernet adapter and loses the link, `reconnect-to-pi.sh` in this repo resets the adapter driver and reconnects. It needs sudo and a NetworkManager connection profile named `Labjack-Pi-Direct`:

```bash
sudo ./reconnect-to-pi.sh
```

## Labjack Service

**Warning:** starting, stopping or restarting the labjack service sets every driver output to off. Valves go to their de-energized state and any ignition sequence in progress ends. Do not do it while a tank is pressurized or a valve is being held open.

```bash
# (on the Pi) is it running? Look for "active (running)" and the start time
systemctl --user status labjack --no-pager

# (on the Pi) restart, stop or start it
systemctl --user restart labjack
systemctl --user stop labjack
systemctl --user start labjack

# (on the Pi) show the service file, including the folder the code runs from
systemctl --user cat labjack

# (on the Pi) after editing the service file itself
systemctl --user daemon-reload
```

- **Do not use `sudo` with these commands.** `sudo systemctl --user` talks to root's services, not yours.
- **After editing `config.ini` or any `.py` file, restart the service.** The config and code are read once at startup, so changes do nothing until then.
- **Stop the service before running `testjack.py`** for pressure transducer calibration. Both use the same USB labjack.
- **Check that only one copy is running:**

```bash
# (on the Pi)
pgrep -af main.py
```

### Starting on boot and after logging out

User services stop when the last login session ends unless "linger" is enabled for the user.

```bash
# (on the Pi) "Linger=yes" means it keeps running after you log out
loginctl show-user eclipsepi | grep Linger

# (on the Pi) turn it on
sudo loginctl enable-linger eclipsepi
```

## Quonkboard Service

This is the dashboard served from the Pi, as set up in Deployment in the [README](README.md).

```bash
# (on the Pi)
systemctl --user status quonkboard --no-pager
systemctl --user restart quonkboard
systemctl --user stop quonkboard
```

## Logs

```bash
# (on the Pi) follow the labjack log live, press Ctrl + C to stop
journalctl --user -u labjack -f

# (on the Pi) the last 100 lines
journalctl --user -u labjack -n 100 --no-pager

# (on the Pi) everything from the last 10 minutes
journalctl --user -u labjack --since "10 min ago" --no-pager
```

`main.py` also writes a log file for each run into a `logs` folder next to the folder it runs from, and a CSV of the sensor data into `data`:

```bash
# (on the Pi) from the folder that contains main.py
ls -t ../logs | head
tail -n 60 ../logs/<newest file>
ls -lh ../data | tail -5
```

Run `systemctl --user cat labjack` to find that folder.

## When the Dashboard Stops Responding

If the Pi stops answering and you need to restart the service, collect this first. A restart destroys the evidence.

```bash
# (on the Pi) is the service alive?
systemctl --user status labjack --no-pager
pgrep -af main.py

# (on the Pi) is port 2707 listening? A large number in Recv-Q means connections are waiting unanswered
ss -ltn 'sport = :2707'

# (on the Pi) compare the newest log line's time to now
date
journalctl --user -u labjack -n 5 --no-pager

# (on the Pi) USB resets or labjack disconnects
dmesg -T | grep -iE 'usb|labjack' | tail
lsusb | grep -i labjack
```

How to read it:
- **The service shows `inactive` or `failed`:** the process exited. The log shows why.
- **The service is `active (running)` but the log stopped updating:** the process is hung. Restart it.
- **The log is current but the dashboard can't connect:** look at the network, not the service.

## Pi Health

```bash
# (on the Pi) disk space - data CSVs and logs build up on the SD card
df -h /
du -sh ../data ../logs

# (on the Pi) memory
free -h

# (on the Pi) power problems: 0x0 is healthy, anything else means under-voltage or throttling
vcgencmd get_throttled

# (on the Pi) CPU and the busiest processes
top -b -n1 | head -15

# (on the Pi) reboot or shut down the whole Pi
sudo reboot
sudo shutdown now
```

## Copying Files To and From the Pi

```bash
# copy one file from the Pi to the current folder
scp eclipsepi@192.168.0.100:<folder>/config.ini .

# copy one file to the Pi
scp config.ini eclipsepi@192.168.0.100:<folder>/

# copy the data folder from the Pi (it can be large)
scp -r eclipsepi@192.168.0.100:<folder>/../data ./pi-data
```

`<folder>` is the folder that contains `main.py`. In MobaXterm you can also drag files in and out of the sidebar.

To copy all the labjack code off the Pi without the bulky files:

```bash
# (on the Pi)
tar czf /tmp/labjack_src.tgz --exclude='__pycache__' --exclude='*.pyc' --exclude='*.csv' --exclude='*.log' -C <folder> .

# on your computer
scp eclipsepi@192.168.0.100:/tmp/labjack_src.tgz .
```

## Dashboard Development

```bash
# install dependencies (after cloning, or when package.json changes)
npm install

# start the development server at http://localhost:3000
npm start

# get the latest code
git pull

# build for deployment into build/
npm run build
```

Running the tests:

```bash
# Windows (PowerShell)
$env:CI='true'; npx react-scripts test --watchAll=false

# Linux / macOS
CI=true npm test -- --watchAll=false
```

Without those settings, `npm test` starts in watch mode and waits for keypresses.

To deploy a build to the Pi, follow Deployment in the [README](README.md).

## Testing the Connection Banner

The banner at the top of the Sphinx and Prometheus pages shows what the dashboard knows about the link to the Pi. You can force each state on purpose.

**Warning:** run these only with all valves de-energized and the igniters disconnected. A frozen process leaves the labjack outputs as they were.

```bash
# (on the Pi) service stopped - the banner should show CONNECTION LOST
systemctl --user stop labjack
systemctl --user start labjack

# (on the Pi) simulate a hung service - the connection stays open but data stops,
# so the banner should show NO DATA after about 5 seconds
kill -STOP $(pgrep -f main.py)

# (on the Pi) let it carry on again
kill -CONT $(pgrep -f main.py)
```

## Troubleshooting

- **`systemctl --user` says it failed to connect to the bus:** you are probably using `sudo`, or you are in a session that was not a normal login. Reconnect with `ssh eclipsepi@192.168.0.100` and run the command again without `sudo`.
- **`Unit labjack.service could not be found`:** run `systemctl --user list-units --type=service | grep -i -E 'labjack|quonk'` to see what the services are called on this Pi.
- **The service starts and then immediately fails:** run `journalctl --user -u labjack -n 50 --no-pager`. Common causes are the labjack being unplugged, another copy of `main.py` already holding the USB device, or a typo in `config.ini`.
- **`ssh` says the connection timed out:** the Pi is off or your computer is not on the `192.168.0.x` network. Check with `ping 192.168.0.100`.
- **`scp` or `ssh` says the host key has changed:** the Pi was reinstalled or replaced. Remove the old entry with `ssh-keygen -R 192.168.0.100` and connect again.
- **A command copied from the handover notes fails with a strange character error:** the notes use typographic dashes. Retype `--user` by hand.
