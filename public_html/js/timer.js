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
                timeout = window.setTimeout(tick, nextTime);
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
    }
    
     // public API
    return {
        addCallback: setCallback,
        start: start,
        stop: stop
    };
})();

var View = (function() 
{
    var sounds = [];
    var inputTime = 0;
    /**
     * Initialize the view, hook up event listeners.
     * @returns {undefined}
     */
    var init = function()
    {
        console.log("Initializing view");
        sounds[0] = new Audio("sound/0.ogg");
        sounds[1] = new Audio("sound/1.ogg");
        sounds[2] = new Audio("sound/2.ogg");
        sounds[3] = new Audio("sound/3.ogg");
        
        Timer.addCallback(timerCallback);
        $("#stop").click(stop);
        $("#time-input").change(start);
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
        var timeField = $("#time-input");
        var timeString = timeField.val();
        return timeString * 1;
    };
    
    /**
     * Start the ticking.
     * 
     * @returns {undefined}
     */
    var start = function() 
    {
        console.log("Starting");
        inputTime = getInputTime();
        Timer.start(inputTime);
    };
    
    /**
     * Stop the ticking
     * 
     * @returns {undefined}
     */
    var stop = function()
    {
        Timer.stop();
        //Stopping all sounds
        for (var i in sounds)
        {
            var sound = sounds[i];
            sound.pause();
            // Revinding for future
            sound.currentTime = 0;
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
        $("#seconds-left").text(second);
    };
    
    var playSound = function(second)
    {
        var sound = sounds[second];
        console.log("Sound: " + sound);
        if (sound !== undefined && sound !== null)
        {
            sound.play();
        }
    };
    
    // public API
    return {
        init: init
    };
})();

// Initializing once the page is ready.
$( document ).ready( View.init );
