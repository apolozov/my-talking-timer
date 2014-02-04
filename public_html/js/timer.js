var timer = (function() 
{
    var running = false;
    var inputTime = 0;
    var targetTime;
    
    var start = function() 
    {
        console.log("Starting");
        running = true;
        inputTime = getInputTime();
        var now = (new Date()).getTime();
        targetTime = now + (inputTime * 1000);
        render();
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
    
    // Changing something in the master.
    
    var stop = function() 
    {
        running = false;
    };
    
    var tick = function() 
    {
        render();
    };
    
    var render = function() 
    {
        var sleft = getTimeLeft();
        $("#seconds-left").text(sleft);
    };
    
    //Changing something else  
    // in the same branch.
    var init = function()
    {
        console.log("Initializing");
        $("#tick").click(tick);
        $("#time-input").change(start);
    };
    
    //Changing something 
    // in some branch.
    
     // public API
    return {
        init: init
    };
})();

$( document ).ready( timer.init );