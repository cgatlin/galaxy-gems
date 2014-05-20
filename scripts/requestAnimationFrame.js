window.requestAnimationFrame = (function ()
{
    var startTime = Date.now();
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback)
        {
            return window.setTimeout(
                function ()
                {
                    callback(Date.now() - startTime);
                }, 1000 / 60
            );
        };
})();

window.cancelRequestAnimationFrame = (function ()
{
    return window.cancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.clearTimeout;
})();
