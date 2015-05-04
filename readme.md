Watson Time and Weather Speech Demo
===================================

Uses a Raspberry Pi and IBM Watson to speak the current time and weather.

Setup
-----

Requires Node.js, tested on v0.12.2. Also requires a Raspberry Pi, tested on 256/128mb Model B's.

The script expects an LED on pin 17 and a button on pin 4. You'll need a pulldown resistor on the button (2.2k worked well for me), and you may want a current-limiting resistor on the LED (I'm using a 330).

Run `npm start` to start the app, or use the included init.d script to run as a daemon.

