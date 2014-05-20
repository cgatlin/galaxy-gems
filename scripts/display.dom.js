jewel.display = (function ()
{
    var dom = jewel.dom,
        $ = dom.$,
        cols, rows,
        jewelSize, firstRun = true,
        jewelSprites

    function initialize(callback)
    {
        // initialize the board
        if (firstRun)
        {
            setup()
            firstRun = false
        }
        callback()
    }


    function redraw(jewels, callback)
    {
        // redraw board
        var x, y
        for (x = 0; x < cols; x++)
        {
            for (y = 0; y < rows; y++)
            {
                drawJewel(jewels[x][y], x, y, 0, 0)
            }
        }
        callback()
    }

    function drawJewel(type, x, y)
    {

        var sprite = jewelSprites[x][y]
        sprite.style.backgroundPosition = type + 'em 0em'
        sprite.style.display = 'block'
    }

    function createBackground()
    {
        var x, y, cell,
            background = document.createElement('div')
        for (x = 0; x < cols; x++)
        {
            for (y = 0; y < cols; y++)
            {
                if ((x + y) % 2)
                {
                    cell = document.createElement('div')
                    cell.style.left = x + 'em'
                    cell.style.top = y + 'em'
                    background.appendChild(cell)
                }
            }
        }
        dom.addClass(background, 'board-bg')
        return background
    }


    function setup()
    {

        var boardElement = $('#game-screen .game-board')[0],
            container = document.createElement('div'),
            sprite, x, y

        cols = jewel.settings.cols
        rows = jewel.settings.rows

        jewelSize = jewel.settings.jewelSize
        jewelSprites = []

        for (x = 0; x < cols; x++)
        {
            jewelSprites[x] = []
            for (y = 0; y < cols; y++)
            {
                sprite = document.createElement('div')
                dom.addClass(sprite, 'jewel')
                sprite.style.left = x + 'em'
                sprite.style.top = y + 'em'
                sprite.style.backgroundImage = 'url(images/jewels' + jewelSize + '.png)'
                sprite.style.backgroundSize = (jewel.settings.numJewelTypes * 100) + '%'
                jewelSprites[x][y] = sprite
                container.appendChild(sprite)
            }
        }
        dom.addClass(container, 'dom-container')
        boardElement.appendChild(createBackground())
        boardElement.appendChild(container)
    }

    return {
        initialize: initialize,
        redraw: redraw
    }
})()