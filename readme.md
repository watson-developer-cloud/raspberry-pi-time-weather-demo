Watson Time and Weather Speech Demo
===================================

Uses a Raspberry Pi to speak the current time and weather.

Setup
----

The script expects an LED on pin 17 and a button on pin 4. Running `node index.js` causes it to watch for interrupts.
You'll need a pulldown resistor on the button (2.2k worked well for me), and you may want a current-limiting resistor on the LED (I'm using a 330)

It can also be run as a daemon with the included /etc/init.d script.

Tested on a Raspberry Pi model B (128/256mb) with node.js 0.12.2.
