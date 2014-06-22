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
            if (callback !== undefined && callback !== null)
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

var View = (function() 
{
    var sounds = [];
    var inputTime = 0;
    var context = null;
    
    /**
     * Called when HTML us _probably_ loaded.
     */
    var loading = function()
    {
        //console.log("ready: " + document.readyState);
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
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        
        loadSound("sound/0.ogg", 0);
        loadSound("sound/1.ogg", 1);
        loadSound("sound/2.ogg", 2);
        loadSound("sound/3.ogg", 3);
        
        Timer.addCallback(timerCallback);
        document.getElementById("start").onclick = start;
        document.getElementById("stop").onclick = stop;
        document.getElementById("time-input").onchange = start;
    };
    
    /**
     * Load audio file from given url and put it into sounds sparse array.
     * @param {type} url Sound file to load
     * @param {type} index Where to put the sound.
     */
    var loadSound = function(url, index)
    {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
          context.decodeAudioData(request.response, function(buffer) {
            sounds[index] = buffer;
          },
          function()
          {
              console.log("Unable to decode " + url);
          }
          );
        };
        request.send();
    };
    
    
    var timerCallback = function(second)
    {
        render(second);
        playSound(second);
    };
    
    /**
     * Get the value entered by user as a number.
     * Massage it as needed.
     * 
     * @returns {Number}
     */
    var getInputTime = function()
    {
        var timeString = document.getElementById("time-input").value;
        return timeString * 1;
    };
    
    /**
     * Start the ticking.
     */
    var start = function() 
    {
        if (! Timer.isRunning())
        {
            console.log("Starting");
            inputTime = getInputTime();
            Timer.start(inputTime);
        }
    };
    
    /**
     * Stop the ticking
     * 
     * @returns {undefined}
     */
    var stop = function()
    {
        if (Timer.isRunning())
        {
            Timer.stop();
            //Stopping all sounds
            for (var i in sounds)
            {
                var sound = sounds[i];
                //TODO: Stop the sound.
                
                // Rewinding for future
                sound.currentTime = 0;
            }
        }
        else
        {
            document.getElementById("time-input").value = "";
            document.getElementById("seconds-left").value = "";
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
            document.getElementById("seconds-left").textContent = second;
    };
    
    var playSound = function(second)
    {
        var source = context.createBufferSource(); // creates a sound source
        var sound = sounds[second];
        if (typeof sound !== "undefined")
        {
            source.buffer = sound;               // tell the source which sound to play
            source.connect(context.destination); // connect the source to the context's destination (the speakers)
            source.start(0);                     // play the source now
            // note: on older systems, may have to use deprecated noteOn(time);
        }
    };
    
    // public API
    return {
        loading: loading
    };
})();

// Initializing once the page is ready.
window.addEventListener("load", View.loading);
