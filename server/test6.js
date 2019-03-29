require("dotenv").config();
var request = require('request').defaults({maxRedirects:20});
const BLYNK_API_URL = process.env.BLYNK_API_URL;
var counter= 0;
// The polling function
function poll(fn, timeout, interval) {
    var endTime = Number(new Date()) + (timeout || 2000);
    interval = interval || 100;

    var checkCondition = function(resolve, reject) {
        // If the condition is met, we're done! 
        var result = fn();
        if(result) {
            resolve(result);
        }
        // If the condition isn't met but the timeout hasn't elapsed, go again
        else if (Number(new Date()) < endTime) {
            setTimeout(checkCondition, interval, resolve, reject);
        }
        // Didn't match and too much time, reject!
        else {
            reject(new Error('timed out for ' + fn + ': ' + arguments));
        }
    };

    return new Promise(checkCondition);
}

function startPoll(){
    poll(function() {
        request.get({url: `${BLYNK_API_URL}`, jar: true}, function(err, resp, body){
            if(err) {
                console.warn(err);
                return;
            }
            console.log("OK!> " + counter);
            counter++;
        }).on('error', function(e){
            console.warn(e);
        }).end();
    }, 50000, 280).then(function(result) {
        // Polling done, now do something else!
        console.log(result);
    }).catch(function(error) {
        // Polling timed out, handle the error!
        console.log("ERROR !!!!!");
        console.warn(error);
        forceGC();
        startPoll();
    });
    
}

// Usage:  ensure element is visible
startPoll();

function forceGC(){
    if(global.gc){
       global.gc();
    } else {
       console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
    }
 }
