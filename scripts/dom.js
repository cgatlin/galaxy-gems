jewel.dom = (function ()
{

    function $(path, parent)
    {
        parent = parent || document;
        return parent.querySelectorAll(path);
    }

    function hasClass(el, clsName)
    {
        var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
        return regex.test(el.className);
    }

    function addClass(el, clsName)
    {
        if (!hasClass(el, clsName))
        {
            el.className += " " + clsName;
        }

    }

    function removeClass(el, clsName)
    {
        var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
        el.className = el.className.replace(regex, " ");
    }

    function bind(element, event, handler)
    {
        if (typeof element == "string")
        {
            element = $(element)[0];
        }
        element.addEventListener(event, handler, false);
    }

    function transform(element, value)
    {
        if ("transform" in element.style)
        {
            element.style.transform = value;
        }
        else if ("webkitTransform" in element.style)
        {
            element.style.webkitTransform = value;
        }
        else if ("mozTransform" in element.style)
        {
            element.style.mozTransform = value;
        }
        else if ("msTransform" in element.style)
        {
            element.style.msTransform = value;
        }
    }

    return {
        $: $,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        bind: bind,
        transform: transform
    };
})();