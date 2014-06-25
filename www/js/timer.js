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
        Timer.addCallback(timerCallback);
        document.getElementById("start").onclick = start;
        document.getElementById("stop").onclick = stop;
        document.getElementById("time-input").onchange = start;
        
        loadSound("/android_asset/www/sound/0.ogg", 0);
        loadSound("/android_asset/www/sound/1.ogg", 1);
        loadSound("/android_asset/www/sound/2.ogg", 2);
        loadSound("/android_asset/www/sound/3.ogg", 3);
    };
    
    /**
     * Load audio file from given url and put it into sounds sparse array.
     * @param {type} url Sound file to load
     * @param {type} index Where to put the sound.
     */
    var loadSound = function(url, index)
    {
        var media = new Media(url,
        function() {
            console.log("played " + url);
        },
        function() {
            console.log("Filed to play " + url);
        }
        );
        sounds[index] = media;
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
            document.getElementById("seconds-left").textContent = second;
    };
    
    var playSound = function(second)
    {
        var sound = sounds[second];
        if (typeof sound !== "undefined")
        {
            sound.play();
        }
    };
    
    // public API
    return {
        loading: loading,
        init: init
    };
})();

// Initializing once the page is ready.
document.addEventListener("deviceready", View.init, false);
