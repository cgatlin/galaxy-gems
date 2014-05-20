jewel.audio = (function ()
{
    var extension,
        sounds,
        activeSounds;

    function initialize()
    {
        extension = formatTest();
        if (!extension)
        {
            return;
        }
        sounds = {};
        activeSounds = [];
    }

    function formatTest()
    {
        var audio = new Audio(),
            types = [
                ["ogg", "audio/ogg; codecs='vorbis'"],
                ["mp3", "audio/mpeg"]
            ];
        for (var i = 0; i < types.length; i++)
        {
            if (audio.canPlayType(types[i][1]) == "probably")
            {
                return types[i][0];
            }
        }
        for (i = 0; i < types.length; i++)
        {
            if (audio.canPlayType(types[i][1]) == "maybe")
            {
                return types[i][0];
            }
        }
    }

    function createAudio(name)
    {
        var el = new Audio("sounds/" + name + "." + extension);
        jewel.dom.bind(el, "ended", cleanActive);
        sounds[name] = sounds[name] || [];

        sounds[name].push(el);
        return el;
    }

    function getAudioElement(name)
    {
        if (sounds[name])
        {
            for (var i = 0, n = sounds[name].length; i < n; i++)
            {
                if (sounds[name][i].ended)
                {
                    return sounds[name][i];
                }
            }
        }
        return createAudio(name);
    }

    function play(name)
    {
        var audio = getAudioElement(name);
        audio.play();
        activeSounds.push(audio);
    }

    function stop()
    {
        for (var i = activeSounds.length - 1; i >= 0; i--)
        {
            activeSounds[i].stop();
        }
        activeSounds.length = 0;
    }

    function cleanActive()
    {
        for (var i = 0; i < activeSounds.length; i++)
        {
            if (activeSounds[i].ended)
            {
                activeSounds.splice(i, 1);
            }
        }
    }

    return {
        initialize: initialize,
        play: play,
        stop: stop
    };

})();
