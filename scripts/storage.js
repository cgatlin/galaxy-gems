jewel.storage = (function ()
{
    var db = window.localStorage;

    function set(key, value)
    {
        value = JSON.stringify(value);
        db.setItem(key, value);
    }

    function get(key)
    {
        var value = db.getItem(key);
        try
        {
            return JSON.parse(value);
        }
        catch (e)
        {
            return;
        }
    }

    return {
        set: set,
        get: get
    };

})();
