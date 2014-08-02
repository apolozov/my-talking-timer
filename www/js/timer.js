// Module pattern as recommended by jquery
var Timer = (function() 
{
    var running = false;
    var targetTime;
    var timeout;
    var callback;
    
    /**
     * Start the timer.
     * 
     * @param {Number} inputTime time in seconds
     * @returns {undefined}
     */
    var start = function(inputTime) 
    {
        console.log("Starting");
        running = true;
        var now = (new Date()).getTime();
        targetTime = now + (inputTime * 1000);
        tick();
    };
    
    /**
     * Time left in milliseconds
     * 
     * @returns {Number}
     */
    var getTimeLeft = function()
    {
        var now = new Date();
        return (targetTime - now.getTime());
    };
    
    var stop = function() 
    {
        running = false;
        window.clearTimeout(timeout);
    };
    
    /**
     * Interval callback.
     * 
     * @returns {undefined}
     */
    var tick = function() 
    {
        if (running)
        {
            var msleft = getTimeLeft();
            if (msleft <= 0)
            {
                running = false;
            }
            else
            {
                var nextTime = msleft % 1000;
                timeout = window.setTimeout(tick, nextTime + 1);
            }

            var second = Math.round(msleft/1000);
            console.log("Second " + second);
            if (typeof callback !== "undefined" && callback !== null)
            {
                callback.call(this, second);
            }
        }
    };
    
    /**
     * Set the callback function that will be called each second.
     * The function will be called with number of seconds left as the parameter.
     * 
     * @param {Function} func
     * @returns {undefined}
     */
    var setCallback = function(func)
    {
        callback = func;
    };
    
    /**
     * Get the state of the timer
     * @returns {Boolean}
     */
    var isRunning = function()
    {
        return running;
    };
    
     // public API
    return {
        addCallback: setCallback,
        start: start,
        stop: stop,
        isRunning: isRunning
    };
})();


var CordovaPlayer = (function() 
{
    var sounds = [];
    var playing = null;
    
    var init = function()
    {
    };
    
    /**
     * Load audio file from given url and put it into sounds sparse array.
     * @param {String} file Sound file to load
     * @param {Integer} index Where to put the sound.
     */
    var loadSound = function(file, index)
    {
        var url = "/android_asset/www/" + file;
        var media = new Media(url,
            function() {
                if (playing === media) playing = null;
                console.log("played " + url);
            },
            function(e) {
                if (playing === media) playing = null;
                console.log("Failed to play " + url + ": " + e);
            }
        );
        sounds[index] = media;
    };
    
    /**
     * Stop the ticking
     * 
     * @returns {undefined}
     */
    var stop = function()
    {
        if (playing !== null)
        {
            playing.stop();
            console.log("stopped sound " + playing);
        }
        Timer.stop();
    };
    
    /**
     * Play the sound by index.
     * 
     * @param {Integer} index index of the sound to play.
     * @returns {undefined}
     */
    var playSound = function(index)
    {
        var sound = sounds[index];
        if (typeof sound !== "undefined")
        {
//Note: when sound goes through bluetooth - the start and end of playing get delayed.
//So, we do allow overlap for sounds for now.
//            if (playing === null)
//            {
                playing = sound;
                sound.play();
//            }
//            else
//            {
//                console.log("skipping sound for " + index + ": already playing something");
//            }
        }
    };
    
    // public API
    return {
        init: init,
        load: loadSound,
        play: playSound,
        stop: stop
    };
})();

var WebAudioPlayer = (function() 
{
    var sounds = [];
    var context = null;
    var playing = null;
    
    var init = function()
    {
        context = new AudioContext();
    };
    
    /**
     * Load audio file from given url and put it into sounds sparse array.
     * @param {String} file Sound file to load
     * @param {Integer} index Where to put the sound.
     */
    var loadSound = function(file, index)
    {
        var request = new XMLHttpRequest();
        request.open('GET', file, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
          context.decodeAudioData(request.response, function(buffer) {
            sounds[index] = buffer;
          },
          function()
          {
              console.log("Unable to decode " + file);
          }
          );
        };
        request.send();
    };
    
    /**
     * Stop the sound if playing
     */
    var stop = function()
    {
        console.log("Don't know how to stop sound yet");
    };
    
    /**
     * Play the sound by index.
     * 
     * @param {Integer} index index of the sound to play.
     * @returns {undefined}
     */
    var playSound = function(index)
    {
        var source = context.createBufferSource(); // creates a sound source
        var sound = sounds[index];
        if (typeof sound !== "undefined")
        {
            source.buffer = sound; // tell the source which sound to play
            source.connect(context.destination); // connect the source to the context's destination (the speakers)
            source.start(0); // play the source now
            // note: on older systems, may have to use deprecated noteOn(time);
        }
    };
    
    // public API
    return {
        init: init,
        load: loadSound,
        play: playSound,
        stop: stop
    };
})();

var View = (function() 
{
    var inputTime = 0;
    var player = null;
    // Choose player for the environment
    if (typeof cordova !== "undefined" ||
            typeof PhoneGap !== "undefined" ||
            typeof phonegap !== "undefined")
    {
        player = CordovaPlayer;
    }
    else if (window.AudioContext || window.webkitAudioContext)
    {
        player = WebAudioPlayer;
    }
    else
    {
        //Dummy player
        player = {
            init: function() {
                console.log("dummy init");
            },
            load: function(file, index) {
                console.log("dummy load " + file + ", " + index);
            },
            play: function(index) {
                console.log("dummy play " + index);
            },
            stop: function() {
                console.log("dummy stop");
            }
        };
    }
    
    player.init();
    
    /**
     * Called when HTML us _probably_ loaded.
     */
    var loading = function()
    {        
        if (document.readyState === "complete")
        {
            init();
        }
        else
        {
            console.log("Postponing init: " + document.readyState);
            setTimeout(loading, 10);
        }
    };
    /**
     * Initialize the view, hook up event listeners.
     */
    var init = function()
    {
        console.log("Initializing view");
        Timer.addCallback(tick);
        document.getElementById("start").onclick = start;
        document.getElementById("stop").onclick = stop;
        //document.getElementById("time-input").onchange = start;
        
        player.load("sound/0.ogg", 0);
        player.load("sound/1.ogg", 1);
        player.load("sound/2.ogg", 2);
        player.load("sound/3.ogg", 3);
        player.load("sound/4.ogg", 4);
        player.load("sound/5.ogg", 5);
        player.load("sound/6.ogg", 6);
        player.load("sound/7.ogg", 7);
        player.load("sound/8.ogg", 8);
        player.load("sound/9.ogg", 9);
        player.load("sound/10.ogg", 10);
        player.load("sound/30.ogg", 30);
        player.load("sound/1m.ogg", 60);
        player.load("sound/3m.ogg", 180);
        player.load("sound/5m.ogg", 300);
        player.load("sound/10m.ogg", 600);
        player.load("sound/15m.ogg", 900);
        player.load("sound/30m.ogg", 1800);
    };
        
    /**
     * This method gets called every second
     * @param {type} second
     */
    var tick = function(second)
    {
        render(second);
        player.play(second);
    };
    
    /**
     * Get the value entered by user as a number.
     * Massage it as needed.
     * 
     * @returns {Number}
     */
    var getInputTime = function()
    {
        var time = 0;
        var timeString = document.getElementById("time-input").value;
        var tlen = timeString.length;
        if (tlen > 4)
        {
            var hourString = timeString.substring(tlen - 6, tlen - 4);
            var hours = parseInt(hourString);
            if (!isNaN(hours))
            {
                time += hours * 3600;
            }
        }
        if (tlen > 2)
        {
            var minuteString = timeString.substring(tlen - 4, tlen -2);
            var minutes = parseInt(minuteString);
            if (!isNaN(minutes))
            {
                time += minutes * 60;
            }
        }
        var secondString = timeString.substring(tlen - 2, tlen);
        var seconds = parseInt(secondString);
        if (!isNaN(seconds))
        {
            time += seconds;
        }
        return time;
    };
    
    /**
     * Start the ticking.
     */
    var start = function() 
    {
        if (Timer.isRunning())
        {
            console.log("Already started");
        }
        else
        {
            console.log("Starting");
            inputTime = getInputTime();
            if (isNaN(inputTime))
            {
                console.log("invalid time!");
            }
            else
            {
                Timer.start(inputTime);
            }
        }
    };
    
    /**
     * Stop the ticking
     * 
     * @returns {undefined}
     */
    var stop = function()
    {
        player.stop();
        if (Timer.isRunning())
        {
            Timer.stop();
        }
        else
        {
            document.getElementById("time-input").value = "";
            document.getElementById("seconds-left").textContent = "";
        }
    };
    
    /**
     * Display the state of the timer.
     * 
     * @param {type} second second
     * @returns {undefined}
     */
    var render = function(second) 
    {
        var seconds = second % 60;
        var minutes = Math.floor(second / 60) % 60;
        var hours = Math.floor(second / 3600);
        document.getElementById("seconds-left").textContent = padNum(seconds, 2);
        document.getElementById("minutes-left").textContent = padNum(minutes, 2);
        document.getElementById("hours-left").textContent = padNum(hours, 2);
    };
    
    var padNum = function(num, size)
    {
        var s = "0" + num;
        return s.substr(s.length-size);
    };
    
    // public API
    return {
        loading: loading,
        init: init
    };
})();
// Initializing once the page is ready.
document.addEventListener("deviceready", View.init, false);
window.addEventListener("load", View.loading(), false);
