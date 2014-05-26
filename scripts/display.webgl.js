jewel.display = (function ()
{
    var animations = [],
        previousCycle,
        paused,
        firstRun = true,
        jewels,
        cursor,
        canvas, gl, cols, rows,
        program,
        geometry = [],
        aVertex, aNormal,
        uScale, uColor;

    function initialize(callback)
    {
        paused = false;
        if (firstRun)
        {
            setup();
            firstRun = false;
        }
        jewels = [];
        requestAnimationFrame(cycle);
        callback();
    }

    function cycle()
    {
        var now = Date.now();
        if (!paused)
        {
            renderAnimations(now, previousCycle);
            if (geometry)
            {
                draw();
            }
        }
        previousCycle = now;
        requestAnimationFrame(cycle);
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

    function draw()
    {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < colors.length; i++)
        {

            gl.bindBuffer(gl.ARRAY_BUFFER, geometry[i].vbo);
            gl.vertexAttribPointer(
                aVertex, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, geometry[i].nbo);
            gl.vertexAttribPointer(
                aNormal, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry[i].ibo);

            for (var j = 0; j < jewels.length; j++)
            {

                drawJewel(jewels[j], i);
            }

        }
    }

    var colors = [
        [0.48, 0.98, 0],
        [0, 1, 1],
        [1, 1, 1],
        [1, .041, .70],
        [1, 0, 0],
        [1, 1, 0],
        [0.2, 0.5, 1]
    ];

    function drawJewel(jwl, type)
    {
        var gem = jwl.type.split(":");

        if (gem[0] == type)
        {
            var webgl = jewel.webgl,
                x = jwl.x - cols / 2 + 0.5,  // make position
                y = -jwl.y + rows / 2 - 0.5, // relative to center
                scale = jwl.scale,
                n = geometry[type].num;

            if (type === 5)
            {
                scale /= 2;
            }
            if (type === 0)
            {
                scale /= 3;
            }

            var mv = webgl.setModelView(gl, program,
                [x * 4.4, y * 4.4, -32], // scale and move back
                Date.now() / 1500 + jwl.rnd * 100, // rotate
                [0, 1, 0.1] // rotation axis
            );
            webgl.setNormalMatrix(gl, program, mv);

            // add effect for selected jewel
            if (cursor && jwl.x == cursor.x && jwl.y == cursor.y)
            {
                scale *= 1.0 + Math.sin(Date.now() / 100) * 0.1;
            }

            gl.uniform1f(uScale, scale);
            gl.uniform3fv(uColor, colors[gem[0]]);

            gl.cullFace(gl.FRONT);
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

            gl.cullFace(gl.BACK);
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
        }

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

    function setup()
    {
        var $ = jewel.dom.$,
            boardElement = $("#game-screen .game-board")[0];

        cols = jewel.settings.cols;
        rows = jewel.settings.rows;

        canvas = document.createElement("canvas");
        gl = jewel.webgl.createContext(canvas);

        jewel.dom.addClass(canvas, "board");
        boardElement.appendChild(canvas);

        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        setupGL();
    }

    function setupGL()
    {
        var webgl = jewel.webgl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        geometry = [];

        program = setupShaders();
        setupTexture();
        gl.useProgram(program);

        aVertex = gl.getAttribLocation(program, "aVertex");
        aNormal = gl.getAttribLocation(program, "aNormal");
        uScale = gl.getUniformLocation(program, "uScale");
        uColor = gl.getUniformLocation(program, "uColor");

        gl.enableVertexAttribArray(aVertex);
        gl.enableVertexAttribArray(aNormal);

        gl.uniform1f(
            gl.getUniformLocation(program, "uAmbient"),
            0.12
        );
        gl.uniform3f(
            gl.getUniformLocation(program, "uLightPosition"),
            20, 15, -10
        );

        webgl.loadModel(gl, "models/jewel.fun.dae", function (geom)
        {
            geometry[0] = geom;
        });

        webgl.loadModel(gl, "models/jewel.planet.dae", function (geom)
        {
            geometry[2] = geom;
        });
        webgl.loadModel(gl, "models/jewel.face.dae", function (geom)
        {
            geometry[3] = geom;
        });
        webgl.loadModel(gl, "models/jewel.ring.dae", function (geom)
        {
            geometry[4] = geom;
        });
        webgl.loadModel(gl, "models/jewel.sat.dae", function (geom)
        {
            geometry[5] = geom;
        });
        webgl.loadModel(gl, "models/jewel.star.dae", function (geom)
        {
            geometry[6] = geom;
        });

        webgl.loadModel(gl, "models/jewel.unstable.dae", function (geom)
        {
            geometry[1] = geom;
        });
        webgl.setProjection(
            gl, program, 60, cols / rows, 0.1, 100
        );
    }

    function setupTexture()
    {
        var webgl = jewel.webgl,
            image = new Image();
        image.addEventListener("load", function ()
        {
            var texture = webgl.createTextureObject(gl, image);
            gl.uniform1i(
                gl.getUniformLocation(program, "uTexture"),
                "uTexture", 0
            );
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
        }, false);
        image.src = "images/jewelpattern.jpg";
    }

    function setupShaders()
    {
        var vsource =
                "attribute vec3 aVertex;\r\n" +
                    "attribute vec3 aNormal;\r\n" +

                    "uniform mat4 uModelView;\r\n" +
                    "uniform mat4 uProjection;\r\n" +
                    "uniform mat3 uNormalMatrix;\r\n" +
                    "uniform vec3 uLightPosition;\r\n" +

                    "uniform float uScale;\r\n" +

                    "varying float vDiffuse;\r\n" +
                    "varying float vSpecular;\r\n" +
                    "varying vec4 vPosition;\r\n" +
                    "varying vec3 vNormal;\r\n" +

                    "void main(void) {\r\n" +
                    "    vPosition = uModelView * vec4(aVertex * uScale, 1.0);\r\n" +
                    "    vNormal = normalize(aVertex);\r\n" +

                    "    vec3 normal = normalize(uNormalMatrix * aNormal);\r\n" +
                    "    vec3 lightDir = uLightPosition - vPosition.xyz;\r\n" +
                    "    lightDir = normalize(lightDir);\r\n" +

                    "    vDiffuse = max(dot(normal, lightDir), 0.0);\r\n" +

                    "    vec3 viewDir = normalize(vPosition.xyz);\r\n" +
                    "    vec3 reflectDir = reflect(lightDir, normal);\r\n" +
                    "    float specular = dot(reflectDir, viewDir);\r\n" +
                    "    vSpecular = pow(specular, 16.0);\r\n" +

                    "    gl_Position = uProjection * vPosition;\r\n" +
                    "}"
            ;

        var fsource =
                "#ifdef GL_ES\r\n" +
                    "precision mediump float;\r\n" +
                    "#endif\r\n" +

                    "uniform sampler2D uTexture;\r\n" +
                    "uniform float uAmbient;\r\n" +
                    "uniform vec3 uColor;\r\n" +

                    "varying float vDiffuse;\r\n" +
                    "varying float vSpecular;\r\n" +
                    "varying vec3 vNormal;\r\n" +

                    "void main(void) {\r\n" +
                    "    float theta = acos(vNormal.y) / 3.14159;" +
                    "    float phi = atan(vNormal.z, vNormal.x) / (2.0 * 3.14159);" +
                    "    vec2 texCoord = vec2(-phi, theta);" +

                    "    float texColor = texture2D(uTexture, texCoord).r;\r\n" +

                    "    float light = uAmbient + vDiffuse + vSpecular + texColor;\r\n" +

                    "    gl_FragColor = vec4(uColor * light, 0.7);\r\n" +
                    "}\r\n"
            ;

        var webgl = jewel.webgl,
            vshader = webgl.createShaderObject(gl, gl.VERTEX_SHADER, vsource),
            fshader = webgl.createShaderObject(gl, gl.FRAGMENT_SHADER, fsource);

        return webgl.createProgramObject(gl, vshader, fshader);
    }

    function setCursor(x, y, selected)
    {
        cursor = null;
        if (arguments.length > 0)
        {
            cursor = {
                x: x,
                y: y,
                selected: selected
            };
        }
    }

    function createJewel(x, y, type)
    {
        var jewel = {
            x: x,
            y: y,
            type: type,
            rnd: Math.random() * 2 - 1,
            scale: 1
        };
        jewels.push(jewel);
        return jewel;
    }

    function getJewel(x, y)
    {
        return jewels.filter(function (j)
        {
            return j.x == x && j.y == y;
        })[0];
    }

    function redraw(newJewels, callback)
    {
        var x, y,
            jewel, type;
        for (x = 0; x < cols; x++)
        {
            for (y = 0; y < rows; y++)
            {
                type = newJewels[x][y];
                jewel = getJewel(x, y);
                if (jewel)
                {
                    jewel.type = type;
                }
                else
                {
                    createJewel(x, y, type);
                }
            }
        }
        callback();
    }

    function moveJewels(movedJewels, callback)
    {
        var n = movedJewels.length;
        movedJewels.forEach(function (mover)
        {
            var jwl = getJewel(mover.fromX, mover.fromY),
                dx = mover.toX - mover.fromX,
                dy = mover.toY - mover.fromY,
                dist = Math.abs(dx) + Math.abs(dy);

            if (!jwl)
            { // new jewel entering from the top
                jwl = createJewel(mover.fromX, mover.fromY,
                    mover.type);
            }
            addAnimation(200 * dist, {
                render: function (pos)
                {
                    pos = Math.sin(pos * Math.PI / 2);
                    jwl.x = mover.fromX + dx * pos;
                    jwl.y = mover.fromY + dy * pos;
                },
                done: function ()
                {
                    jwl.x = mover.toX;
                    jwl.y = mover.toY;
                    if (--n === 0)
                    { // last one calls callback
                        callback();
                    }
                }
            });
        });
    }

    function removeJewels(removedJewels, callback)
    {
        var n = removedJewels.length;
        removedJewels.forEach(function (removed)
        {
            var jwl = getJewel(removed.x, removed.y),
                y = jwl.y, // original coordinates
                x = jwl.x;
            addAnimation(400, {
                render: function (pos)
                {
                    jwl.x = x + jwl.rnd * pos * 2;
                    jwl.y = y + pos * pos * 2;
                    jwl.scale = 1 - pos;
                },
                done: function ()
                {
                    jewels.splice(jewels.indexOf(jwl), 1);
                    if (--n === 0)
                    { // last one calls callback
                        callback();
                    }
                }
            });
        });
    }

    function refill(newJewels, callback)
    {
        redraw(newJewels, callback);
    }

    function gameOver(callback)
    {
        removeJewels(jewels, callback);
    }

    function levelUp(callback)
    {
        addAnimation(500, {
            render: function (pos)
            {
                gl.uniform1f(
                    gl.getUniformLocation(program, "uAmbient"),
                    0.12 + Math.sin(pos * Math.PI) * 0.5
                );
            },
            done: callback
        });
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
