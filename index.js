'use strict';
var watson = require('watson-developer-cloud');
var fs = require('fs');
var format = require('util').format;
require('date-util');
var cp = require('child_process');
var async = require('async');
var request = require('request');
require('dotenv').load({silent: true});

var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(4, 'in', 'both');

function exit() {
    led.unexport();
    button.unexport();
    process.exit();
}

process.on('SIGINT', exit);

button.watch(function(err, value) {
    if (err) {
        return console.error(err);
    }
    console.log('button changed to %s', value);
    led.writeSync(value);
    if(value) {
        playTimeAndDate();
    }
});

var ledTimeout, ledOn = 0;

function ledTick() {
    ledOn = ledOn ? 0 : 1;
    led.writeSync(ledOn);
    // if on, turn off in 100ms. If off, turn on in 400ms
    var nextTick = ledOn ? 100 : 400;
    ledTimeout = setTimeout(ledTick, nextTick);
}

function blink(next) {
    clearTimeout(ledTimeout);
    ledTick();
    if(next) {
        next();
    }
}

function noBlink(next) {
    clearTimeout(ledTimeout);
    led.writeSync(0);
    if(next) {
        next();
    }
}


// todo: make time and date configurable (and/or figure them out from geolocation or whatever

var text_to_speech = watson.text_to_speech({
    "username": process.env.TTS_USERNAME,
    "password": process.env.TTS_PASSWORD,
    version: 'v1'
});


function audioFilePath(text) {
    // todo: ensure this directory exists
    return __dirname + '/cache/' + text.replace(/[^a-z0-9-_]/ig, '-') + '.opus';
}

function cacheAudio(text, next) {
    var outfile = audioFilePath(text);

    fs.exists(outfile, function(alreadyCached) {
        if (alreadyCached) {
            console.log('using cached audio: %s', outfile);
            return next(null,  outfile);
        } else {
            console.log('fetching audio: %s', text);

            var params = {
                text: text,
                //voice: 'en-US_MichaelVoice', // Optional voice
                accept: 'audio/ogg; codec=opus' //'audio/wav'
            };

            // Pipe the synthesized text to a file
            text_to_speech.synthesize(params)
                .pipe(fs.createWriteStream(outfile))
                .on('error', next)
                .on('close', function() {
                    return next(null, outfile);
                });
        }
    });
}

function playAudioFrom(which) {
    return function(next, results) {
        var filename = results[which];
        console.log('playing %s (%s)', which, filename);
        cp.exec(format('omxplayer -o local %s', filename), next);
    }
}

function getWeather(next) {
    console.log('fetching weather');

    var url =  "https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='New York City, NY')&format=json";
    request({
        url: url,
        json: true
    }, function (err, response, body) {
        if (err) {
            return next (err);
        }
        if (response.statusCode != 200) {
            return next(new Error(format("Unexpected status code %s from %s\n%s", response.statusCode, url, body)));
        }
        try {
            next(null, body.query.results.channel.item.condition);
        } catch(ex) {
            ex.message = format("Unexpected response format from %s - %s", url, ex.message);
            next(ex);
        }
    });
}

function getTimeAudio(next) {
    var now = new Date();
    now.setHours(now.getUTCHours() - 4); // EDT
    cacheAudio(format('The current time in New York City is %s.', now.format("h:MM")), next);
}

function getWeatherAudio(next, results) {
    cacheAudio(format('The current weather conditions are %s degrees and %s.', results.weather.temp, results.weather.text), next);
}

// todo: debounce
function playTimeAndDate() {
    // async.auto is magical
    async.auto({
        loading: blink,
        timeAudio: getTimeAudio,
        loaded: ['timeAudio', noBlink],
        playTime: ['timeAudio', playAudioFrom('timeAudio')],
        weather: getWeather,
        weatherAudio: ['weather', getWeatherAudio],
        playWeather: ['playTime', 'weatherAudio', playAudioFrom('weatherAudio')]
    }, function(err, results) {
        if (err) {
            return console.error(err);
        }
        //console.log(results);
    });
}


console.log('ready for input, playing once to test');
playTimeAndDate();
