jewel.display = (function ()
{
    var canvas, ctx,
        cols, rows,
        cursor,
        jewelSize,
        jewels,
        jewelSprite,
        previousCycle,
        animations = [],
        firstRun = true,
        paused;

    function createBackground()
    {
        var background = document.createElement("canvas"),
            bgctx = background.getContext("2d");

        jewel.dom.addClass(background, "background");
        background.width = cols * jewelSize;
        background.height = rows * jewelSize;

        bgctx.fillStyle = "rgba(225,235,255,0.15)";
        for (var x = 0; x < cols; x++)
        {
            for (var y = 0; y < cols; y++)
            {
                if ((x + y) % 2)
                {
                    bgctx.fillRect(
                        x * jewelSize, y * jewelSize,
                        jewelSize, jewelSize
                    );
                }
            }
        }
        return background;
    }

    function setup()
    {
        var $ = jewel.dom.$,
            boardElement = $("#game-screen .game-board")[0];

        cols = jewel.settings.cols;
        rows = jewel.settings.rows;

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        jewel.dom.addClass(canvas, "board");

        var rect = boardElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        jewelSize = rect.width / cols;

        boardElement.appendChild(createBackground());
        boardElement.appendChild(canvas);

        previousCycle = Date.now();
        requestAnimationFrame(cycle);
    }

    function cycle()
    {
        var now = Date.now();
        if (!paused)
        {
            // hide cursor while animating
            if (animations.length === 0)
            {
                renderCursor(now);
            }
            renderAnimations(now, previousCycle);
        }
        previousCycle = now;
        requestAnimationFrame(cycle);
    }

    function initialize(callback)
    {
        paused = false;
        if (firstRun)
        {
            setup();
            jewelSprite = new Image();
            jewelSprite.addEventListener(
                "load", callback, false);
            jewelSprite.src =
                "images/jewels" + jewelSize + ".png";
            firstRun = false;
        }
        else
        {
            callback();
        }
    }

    function drawJewel(type, x, y, scale, rot)
    {
        ctx.save();
        if (typeof scale !== "undefined" && scale > 0)
        {
            ctx.beginPath();
            ctx.translate((x + 0.5) * jewelSize, (y + 0.5) * jewelSize);
            ctx.scale(scale, scale);
            if (rot)
            {
                ctx.rotate(rot);
            }
            ctx.translate(-(x + 0.5) * jewelSize, -(y + 0.5) * jewelSize);
        }
        ctx.drawImage(jewelSprite,
            type * jewelSize, 0, jewelSize, jewelSize,
            x * jewelSize, y * jewelSize,
            jewelSize, jewelSize
        );
        ctx.restore();
    }

    function redraw(newJewels, callback)
    {
        var x, y;
        jewels = newJewels;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (x = 0; x < cols; x++)
        {
            for (y = 0; y < rows; y++)
            {
                 var gem = jewels[x][y].split(":");
                drawJewel(gem[0], x, y);
            }
        }
        callback();
    }

    function renderCursor(time)
    {
        if (!cursor)
        {
            return;
        }
        var x = cursor.x,
            y = cursor.y,
            t1 = (Math.sin(time / 200) + 1) / 2,
            t2 = (Math.sin(time / 400) + 1) / 2;

        clearCursor();

        if (cursor.selected)
        {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.8 * t1;
             var gem = jewels[x][y].split(":");
                drawJewel(gem[0], x, y);
            ctx.restore();
        }
        ctx.save();
        ctx.lineWidth = 0.05 * jewelSize;
        ctx.strokeStyle =
            "rgba(250,250,150," + (0.5 + 0.5 * t2) + ")";
        ctx.strokeRect(
            (x + 0.05) * jewelSize, (y + 0.05) * jewelSize,
            0.9 * jewelSize, 0.9 * jewelSize
        );
        ctx.restore();
    }

    function addAnimation(runTime, fncs)
    {
        var anim = {
            runTime: runTime,
            startTime: Date.now(),
            pos: 0,
            fncs: fncs
        };
        animations.push(anim);
    }

    function renderAnimations(time, lastTime)
    {
        var anims = animations.slice(0), // copy list
            n = anims.length,
            animTime,
            anim,
            i;

        // call before() function
        for (i = 0; i < n; i++)
        {
            anim = anims[i];
            if (anim.fncs.before)
            {
                anim.fncs.before(anim.pos);
            }
            anim.lastPos = anim.pos;
            animTime = (lastTime - anim.startTime);
            anim.pos = animTime / anim.runTime;
            anim.pos = Math.max(0, Math.min(1, anim.pos));
        }

        animations = []; // reset animation list

        for (i = 0; i < n; i++)
        {
            anim = anims[i];
            anim.fncs.render(anim.pos, anim.pos - anim.lastPos);
            if (anim.pos == 1)
            {
                if (anim.fncs.done)
                {
                    anim.fncs.done();
                }
            }
            else
            {
                animations.push(anim);
            }
        }
    }

    function moveJewels(movedJewels, callback)
    {
        var n = movedJewels.length,
            oldCursor = cursor;
        cursor = null;
        movedJewels.forEach(function (e)
        {
            var x = e.fromX, y = e.fromY,
                dx = e.toX - e.fromX,
                dy = e.toY - e.fromY,
                dist = Math.abs(dx) + Math.abs(dy);
            addAnimation(200 * dist, {
                before: function (pos)
                {
                    pos = Math.sin(pos * Math.PI / 2);
                    clearJewel(x + dx * pos, y + dy * pos);
                },
                render: function (pos)
                {
                    pos = Math.sin(pos * Math.PI / 2);
                    drawJewel(
                        e.type,
                        x + dx * pos, y + dy * pos
                    );
                },
                done: function ()
                {
                    if (--n == 0)
                    {
                        cursor = oldCursor;
                        callback();
                    }
                }
            });
        });
    }

    function removeJewels(removedJewels, callback)
    {
        var n = removedJewels.length;
        removedJewels.forEach(function (e)
        {
            addAnimation(400, {
                before: function ()
                {
                    clearJewel(e.x, e.y);
                },
                render: function (pos)
                {
                    ctx.save();
                    ctx.globalAlpha = 1 - pos;
                    drawJewel(
                        e.type, e.x, e.y,
                        1 - pos, pos * Math.PI * 2
                    );
                    ctx.restore();
                },
                done: function ()
                {
                    if (--n == 0)
                    {
                        callback();
                    }
                }
            });
        });
    }

    function refill(newJewels, callback)
    {
        var lastJewel = 0;
        addAnimation(1000, {
            render: function (pos)
            {
                var thisJewel = Math.floor(pos * cols * rows),
                    i, x, y;
                for (i = lastJewel; i < thisJewel; i++)
                {
                    x = i % cols;
                    y = Math.floor(i / cols);
                    clearJewel(x, y);
                    drawJewel(newJewels[x][y], x, y);
                }
                lastJewel = thisJewel;
                jewel.dom.transform(canvas, "rotateX(" + (360 * pos) + "deg)");
            },
            done: function ()
            {
                canvas.style.webkitTransform = "";
                callback();
            }
        });
    }

    function levelUp(callback)
    {
        addAnimation(1000, {
            before: function (pos)
            {
                var j = Math.floor(pos * rows * 2),
                    x, y;
                for (y = 0, x = j; y < rows; y++, x--)
                {
                    if (x >= 0 && x < cols)
                    { // boundary check
                        clearJewel(x, y);
                         var gem = jewels[x][y].split(":");
                drawJewel(gem[0], x, y);
                    }
                }
            },
            render: function (pos)
            {
                var j = Math.floor(pos * rows * 2),
                    x, y;
                ctx.save(); // remember to save state
                ctx.globalCompositeOperation = "lighter";
                for (y = 0, x = j; y < rows; y++, x--)
                {
                    if (x >= 0 && x < cols)
                    { // boundary check
                         var gem = jewels[x][y].split(":");
                drawJewel(gem[0], x, y,1.1);
                    }
                }
                ctx.restore();
            },
            done: callback
        });
    }

    function clearCursor()
    {
        if (cursor)
        {
            var x = cursor.x,
                y = cursor.y;
            clearJewel(x, y);
            var gem = jewels[x][y].split(":");
                drawJewel(gem[0], x, y);
        }
    }

    function setCursor(x, y, selected)
    {
        clearCursor();
        if (arguments.length > 0)
        {
            cursor = {
                x: x,
                y: y,
                selected: selected
            };
        }
        else
        {
            cursor = null;
        }
    }

    function clearJewel(x, y)
    {
        ctx.clearRect(
            x * jewelSize, y * jewelSize, jewelSize, jewelSize
        );
    }

    function gameOver(callback)
    {
        addAnimation(1000, {
            render: function (pos)
            {
                canvas.style.left =
                    0.2 * pos * (Math.random() - 0.5) + "em";
                canvas.style.top =
                    0.2 * pos * (Math.random() - 0.5) + "em";
            },
            done: function ()
            {
                canvas.style.left = "0";
                canvas.style.top = "0";
                explode(callback);
            }
        });
    }

    function explode(callback)
    {
        var pieces = [],
            piece,
            x, y;
        for (x = 0; x < cols; x++)
        {
            for (y = 0; y < rows; y++)
            {
                 var gem = jewels[x][y].split(":");

                piece = {
                    type: gem[0],
                    pos: {
                        x: x + 0.5,
                        y: y + 0.5
                    },
                    vel: {
                        x: (Math.random() - 0.5) * 20,
                        y: -Math.random() * 10
                    },
                    rot: (Math.random() - 0.5) * 3
                }
                pieces.push(piece);
            }
        }

        addAnimation(2000, {
            before: function (pos)
            {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            },
            render: function (pos, delta)
            {
                explodePieces(pieces, pos, delta);
            },
            done: callback
        });
    }

    function explodePieces(pieces, pos, delta)
    {
        var piece, i;
        for (i = 0; i < pieces.length; i++)
        {
            piece = pieces[i];

            piece.vel.y += 50 * delta;
            piece.pos.y += piece.vel.y * delta;
            piece.pos.x += piece.vel.x * delta;

            if (piece.pos.x < 0 || piece.pos.x > cols)
            {
                piece.pos.x = Math.max(0, piece.pos.x);
                piece.pos.x = Math.min(cols, piece.pos.x);
                piece.vel.x *= -1;
            }

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.translate(piece.pos.x * jewelSize, piece.pos.y * jewelSize);
            ctx.rotate(piece.rot * pos * Math.PI * 4);
            ctx.translate(-piece.pos.x * jewelSize, -piece.pos.y * jewelSize);
            drawJewel(piece.type,
                piece.pos.x - 0.5,
                piece.pos.y - 0.5
            );
            ctx.restore();
        }
    }

    function pause()
    {
        paused = true;
    }

    function resume(pauseTime)
    {
        paused = false;
        for (var i = 0; i < animations.length; i++)
        {
            animations[i].startTime += pauseTime;
        }
    }

    return {
        initialize: initialize,
        redraw: redraw,
        setCursor: setCursor,
        moveJewels: moveJewels,
        removeJewels: removeJewels,
        refill: refill,
        levelUp: levelUp,
        gameOver: gameOver,
        pause: pause,
        resume: resume
    };
})();
