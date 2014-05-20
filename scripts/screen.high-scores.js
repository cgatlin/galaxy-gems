jewel.screens["high-scores"] = (function ()
{
    var numScores = 10,
        firstRun = true;

    function setup()
    {
        var $ = jewel.dom.$,
            backButton = $("#high-scores button.back")[0];
        jewel.dom.bind(backButton, "click", function ()
        {
            jewel.showScreen("main-menu");
        });
    }

    function run()
    {
        if (firstRun)
        {
            setup();
            firstRun = false;
        }
        populateList();
        var score = jewel.storage.get("lastScore");
        if (score)
        {
            jewel.storage.set("lastScore", null);
            checkScores(score);
        }
    }

    function getScores()
    {
        return jewel.storage.get("scores") || [];
    }

    function addScore(score, position)
    {
        var scores = getScores(),
            name, entry;

        name = prompt("Please enter your name:");
        entry = {
            name: name,
            score: score
        };
        scores.splice(position, 0, entry);
        jewel.storage.set(
            "scores", scores.slice(0, numScores)
        );
        populateList();
    }

    function checkScores(score)
    {
        var scores = getScores();
        for (var i = 0; i < scores.length; i++)
        {
            if (score > scores[i].score)
            {
                addScore(score, i);
                return;
            }
        }
        if (scores.length < numScores)
        {
            addScore(score, scores.length);
        }
    }

    function populateList()
    {
        var scores = getScores(),
            list = jewel.dom.$("#high-scores ol.score-list")[0],
            item, nameEl, scoreEl, i;

        // make sure the list is full
        for (i = scores.length; i < numScores; i++)
        {
            scores.push({
                name: "---",
                score: 0
            });
        }

        list.innerHTML = "";

        for (i = 0; i < scores.length; i++)
        {
            item = document.createElement("li");

            nameEl = document.createElement("span");
            nameEl.innerHTML = scores[i].name;

            scoreEl = document.createElement("span");
            scoreEl.innerHTML = scores[i].score;

            item.appendChild(nameEl);
            item.appendChild(scoreEl);
            list.appendChild(item);
        }
    }

    return {
        run: run
    };

})();
