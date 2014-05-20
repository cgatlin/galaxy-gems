jewel.screens["splash-screen"] = (function ()
{

    var firstRun = true;

    function setup()
    {
        var dom = jewel.dom, $ = dom.$, screen = $("#splash-screen")[0];
        $(".continue", screen)[0].style.display = "block";
        jewel.dom.bind('#splash-screen', 'click', function ()
        {
            jewel.showScreen("main-menu");
        });
    }

    function checkProgress()
    {
        var $ = jewel.dom.$, p = jewel.getLoadProgress() * 100;

        $('#splash-screen .indicator')[0].style.width = p + "%";
        if (p == 100)
        {
            setup();
        }
        else
        {
            setTimeout(checkProgress, 30);
        }
    }

    function run()
    {
        if (firstRun)
        {
            checkProgress();
            firstRun = false;
        }
    }

    return{run: run};

})();