Watson Time and Weather Speech Demo
===================================

Uses a Raspberry Pi and IBM Watson to speak the current time and weather.

[![assembled system](http://watson-developer-cloud.github.io/rpi-time-weather-demo/time-weather-small.jpg)](http://watson-developer-cloud.github.io/rpi-time-weather-demo/time-weather.jpg)

Setup
-----

Requires Node.js, tested on v0.12.2. (I'm using a [pre-compiled binary from conoroneill.net](http://conoroneill.net/node-v0122-for-arm-v6v7-including-raspberry-pi-raspberry-pi-2-and-odroid-c1), although building from source is also an option.) Also requires a Raspberry Pi, tested on 256/128mb Model B's. 

Download the code and run `npm install` to fetch dependencies.

Next you'll need to get credentials by creating Text to Speech service instance on bluemix and binding it to a server. Edit `index.js` to include your username and password.

The script expects an LED on pin 17 and a button on pin 4. You'll need a pulldown resistor on the button (2.2k worked well for me), and you may want current-limiting resistors on both the LED and the button (I'm using 330Ω).

![breadboard](http://watson-developer-cloud.github.io/rpi-time-weather-demo/time-weather_bb.png)

Run `npm start` to start the app, or use the included init.d script to run as a daemon. 

For the dameon:

1. Ensure the DAEMON and DAEMON_ARGS paths are correct
2. `sudo cp etc-init.d/time-weather /etc/init.d` # copy the script to the init.d folder where startup scripts are kept
3. `sudo chmod +x /etc/init.d/time-weather` # ensure it's executible
4. `sudo update-rc.d time-weather defaults` # enable it
5. Reboot your Pi

