Watson Time and Weather Speech Demo
===================================

Uses a Raspberry Pi and IBM Watson to speak the current time and weather.

Also see https://github.com/watson-developer-cloud/raspberry-pi-speech-to-text for an example of using Speech to Text on a Raspberry Pi. 

[![assembled system](http://watson-developer-cloud.github.io/raspberry-pi-time-weather-demo/time-weather-small.jpg)](http://watson-developer-cloud.github.io/raspberry-pi-time-weather-demo/time-weather.jpg)

Setup
-----

Requires Node.js, tested on [v0.12.2] and [v4.2.0]. (For a Pi v1, you'll want the armv6l release, for a pi v2, you'll want the armv7l release).
Also requires a Raspberry Pi, tested on 256/128mb Model B's but should also work on newer ones. 

Download the code and run `npm install` to fetch dependencies.

Next you'll need to get credentials by creating [Text to Speech service](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/text-to-speech.html) instance on bluemix and binding it to a server. 
The credentials may go into environment properties, a [.env] file, or just edit `index.js`.

The script expects an LED on pin 17 and a button on pin 4. 
You'll need a pulldown resistor on the button (2.2k worked well for me), and you may want current-limiting resistors on both the LED and the button (I'm using 330Ω).

Note: the script automatically reports the current time and weather at startup, so you can test it even without the extra hardware.

![breadboard](http://watson-developer-cloud.github.io/raspberry-pi-time-weather-demo/time-weather_bb.png)

Run `npm start` to start the app, or use the included init.d script to run as a daemon. 

For the dameon:

1. Ensure the DAEMON and DAEMON_ARGS paths are correct
2. `sudo cp etc-init.d/time-weather /etc/init.d` # copy the script to the init.d folder where startup scripts are kept
3. `sudo chmod +x /etc/init.d/time-weather` # ensure it's executable
4. `sudo update-rc.d time-weather defaults` # enable it
5. Reboot your Pi

[v0.12.2]: http://conoroneill.net/node-v0122-for-arm-v6v7-including-raspberry-pi-raspberry-pi-2-and-odroid-c1
[v4.2.0]: https://nodejs.org/dist/v4.2.1/
[.env]: https://www.npmjs.com/package/dotenv
