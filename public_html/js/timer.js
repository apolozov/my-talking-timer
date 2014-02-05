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
            }
            else
            {
                timeout = window.setTimeout(tick, 1000);
            }
        }
        render();
    };
    
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

$( document ).ready( timer.init );
