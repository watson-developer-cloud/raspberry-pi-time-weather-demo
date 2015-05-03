'use strict';
var watson = require('watson-developer-cloud');
var fs = require('fs');
var format = require('util').format;
require('date-util');
var cp = require('child_process');
var async = require('async');
var request = require('request');

var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(4, 'in', 'both');

button.watch(function(err, value) {
    console.log('button changed to %s', value);
    led.writeSync(value);
    if(value) {
        playTimeAndDate();
    }
});


// todo: make time and date configurable (and/or figure them out from geolocation or whatever

var text_to_speech = watson.text_to_speech({
    "username": "0eaef628-d28e-4365-b0db-069046f37fef",
    "password": "Mm1DWPHFC7sq",
    version: 'v1'
});


function audioFileName(text) {
    // todo: ensure this directory exists
    return './cache/' + text.replace(/[^a-z0-9-_]/ig, '-') + '.opus';
}

function cacheAudio(text, next) {
    var outfile = audioFileName(text);

    fs.exists(outfile, function(alreadyCached) {
        if (alreadyCached) {
            console.log('using cached audio: %s', outfile);
            return next(null,  outfile);
        } else {
            console.log('fetching audio: %s', text);

            var params = {
                text: text,
                //voice: 'VoiceEnUsMichael', // Optional voice
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
        cp.exec(format('omxplayer %s', filename), next);
    }
}

function weather(next) {
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
    cacheAudio(format('%s.', now.format("h:MM")), next);
}

function getWeatherAudio(next, results) {
    cacheAudio(format('%s degrees and %s.', results.weather.temp, results.weather.text), next);
}

// todo: debounce
function playTimeAndDate() {
    // async.auto is magical
    async.auto({
        cacheTimeStart: cacheAudio.bind(null, 'The current time in New York City is'),
        playTimeStart: ['cacheTimeStart', playAudioFrom('cacheTimeStart')],
        cacheTimeEnd: getTimeAudio,
        playTimeEnd: ['playTimeStart', 'cacheTimeEnd', playAudioFrom('cacheTimeEnd')],
        cacheWeatherStart: cacheAudio.bind(null, 'The current weather conditions are'),
        playWeatherStart: ['playTimeEnd', 'cacheWeatherStart', playAudioFrom('cacheWeatherStart')],
        weather: weather,
        cacheWeatherEnd: ['weather', getWeatherAudio],
        playWeatherEnd: ['weather', 'playWeatherStart', 'cacheWeatherEnd', playAudioFrom('cacheWeatherEnd')],
    }, function(err, results) {
        if (err) {
            return console.error(err);
        }
        //console.log(results);
    });
}


