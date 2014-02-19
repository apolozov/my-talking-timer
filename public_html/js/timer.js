// Module pattern as recommended by jquery
var timer = (function() 
{
    var running = false;
    var inputTime = 0;
    var targetTime;
    var timeout;
    
    /**
     * Start the ticking.
     * 
     * @returns {undefined}
     */
    var start = function() 
    {
        console.log("Starting");
        running = true;
        inputTime = getInputTime();
        var now = (new Date()).getTime();
        targetTime = now + (inputTime * 1000);
        tick();
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
            if (getTimeLeft() <= 0)
            {
                running = false;
                finish();
            }
            else
            {
                var seconds = Math.round(getTimeLeft()/1000);
        console.log("Second " + seconds);
                var say=null;
                if (seconds === 1)
                {
                    say = document.getElementById("sound-1");
                }
                else if (seconds === 2)
                {
                    say = document.getElementById("sound-2");
                }
                else if (seconds === 3)
                {
                    //say = document.getElementById("sound-3");
                    say = new Audio("sound/3.ogg");
                }
                if (say !== null)
                {
                    say.play();
                }
                var nextTime = getTimeLeft() % 1000;
                timeout = window.setTimeout(tick, nextTime);
            }
        }
        render();
    };
    
    var finish = function()
    {
        //finalSound = new Audio("../sound/final.mp3");
        //For some reason $("#sound-final") doesn't work...
        var finalSound = document.getElementById("sound-0");
        finalSound.play();
        //alert("Done: " + getTimeLeft());
    };
    
    /**
     * Display the state of the timer.
     * 
     * @returns {undefined}
     */
    var render = function() 
    {
        var sleft = getTimeLeft();
        $("#seconds-left").text(sleft);
    };
    
    /**
     * Initialize the system, hook up event listeners.
     * @returns {undefined}
     */
    var init = function()
    {
        console.log("Initializing");
        $("#stop").click(stop);
        $("#time-input").change(start);
    };
    
     // public API
    return {
        init: init
    };
})();
// Initializing once the page is ready.
$( document ).ready( timer.init );
