Watson Time and Weather Speech Demo
===================================

Uses a Raspberry Pi and IBM Watson to speak the current time and weather.

Setup
-----

Requires Node.js, tested on v0.12.2. (I'm using a [pre-compiled binary from conoroneill.net](http://conoroneill.net/node-v0122-for-arm-v6v7-including-raspberry-pi-raspberry-pi-2-and-odroid-c1), although building from source is also an option.) Also requires a Raspberry Pi, tested on 256/128mb Model B's. 

Next you'll need to get credentials by creating Text to Speech service instance on bluemix and binding it to a server. Edit `index.js` to include your username and password.

The script expects an LED on pin 17 and a button on pin 4. You'll need a pulldown resistor on the button (2.2k worked well for me), and you may want a current-limiting resistor on the LED (I'm using a 330).

Run `npm start` to start the app, or use the included init.d script to run as a daemon. 

For the dameon:

1. Ensure the DAEMON and DAEMON_ARGS paths are correct
2. Copy the script to your `/etc/init.d` folder
3. `chmod +x /etc/init.d/time-weather`
4. `sudo update-rc.d /etc/init.d/time-weather defaults`
5. Reboot your Pi

