let height = 0;
let width = 0;
let Probability = 7;
let minMines;
var difficulty = 'Easy';
let field;
let mines = new Map();
minMines = -1;
let FalseFlags = new Map();
let state;
let firstClick = true;

function init() {
    firstClick = true;
    disableField(false)
    var difficulty = document.getElementById('difficulty').value;
    document.getElementById('field').style.display = "block";
    if (difficulty == 'Easy') {
        height = 9;
        width = 9;
        Probability = 8;
        minMines = 10;
    } else if (difficulty == 'Medium') {
        height = 15;
        width = 19;
        Probability = 8;
        minMines = 47;
    } else if (difficulty == 'Hard') {
        height = 20;
        width = 27;
        Probability = 7;
        minMines = 100;
    } else if (difficulty == 'Insane') {
        height = 26;
        width = 37;
        Probability = 7;
        minMines = 150;
    } else if (difficulty == 'Inhumane') {
        height = 27;
        width = 55;
        Probability = 7;
        minMines = 230;
    } else if (difficulty == 'Impossible') {
        height = 49;
        width = 101;
        Probability = 5;
        minMines = 1200;
    }

    field = new Array(height);
    for (let i = 0; i < height; i++)
        field[i] = new Array(width).fill(0);
    mines = new Map();
    minesNum = 0;
    FalseFlags = new Map();
    state = new Array(height);
    for (let i = 0; i < height; i++)
        state[i] = new Array(width).fill(0);
    newGame();
    click();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

class Point {
    constructor(str) {
        this.x = parseInt(str.split(',')[0].trim());
        this.y = parseInt(str.split(',')[1].trim());
    }
    pointToString() {
        return this.x + "," + this.y;
    }
}

function XYtoString(x, y) {
    let id = x + ',' + y;
    return id;
}

function newIcon(className, id) {
    let icon = document.createElement('i');
    for (let i = 0; i < className.length; i++)
        icon.classList.add(className[i]);
    icon.setAttribute('id', id);
    return icon;
}

function newGame() {
    document.getElementById('loseOverlayDiv').style.display = "none";
    document.getElementById('winOverlayDiv').style.display = "none";
    var table = document.getElementById("game");
    if (table != null)
        table.parentElement.removeChild(table);
    table = document.createElement('table');
    table.setAttribute("class", "button-table");
    table.setAttribute("id", "game");
    for (var raws = 0; raws < height; raws++) {
        var myTR = document.createElement('tr');
        for (var cols = 0; cols < width; cols++) {
            var btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.style = "width: 30px; height: 30px; border : none;";
            btn.setAttribute('id', raws + "," + cols);
            btn.classList.add('block');
            var myTd = document.createElement("td");
            myTd.appendChild(btn);
            myTd.style = "width: 20px; height: 20px";
            myTR.appendChild(myTd);
        }
        table.appendChild(myTR);
    }
    document.getElementById('field').appendChild(table);
    document.getElementById('field').style.display = "block";
    document.getElementById("field").style = 'width:' + ((30 * width) + (width * 4)) + 'px';
    document.getElementById('field').style.margin = 'auto';
    colorize();
}

function colorize() {
    b = true;
    for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++, b = !b)
            if (i > height / 2)
                if (b)
                    document.getElementById(XYtoString(i, j)).style.background = '#40b3ff'; // blue
                else
                    document.getElementById(XYtoString(i, j)).style.background = '#4a92c2'; // blue
            else
                if (b)
                    document.getElementById(XYtoString(i, j)).style.background = '#c7b22c'; // yellow
                else
                    document.getElementById(XYtoString(i, j)).style.background = '#ffe95c'; // yellow
}

function createField(id) {
    {
        // get Adjacentes
        let adj = [];
        let adjPoint = getAdjacentes(id);
        for (const k of adjPoint) {
            adj.push(k.pointToString());
        }
        // Create mines
        while (minesNum < minMines) {
            let i = getRandomInt(height);
            let j = getRandomInt(width);

            if (XYtoString(i, j) == id.pointToString() || adj.includes(XYtoString(i, j))) continue;
            if (!mines.has(XYtoString(i, j))) {
                setMine(i, j);
                // fill around mines
                incrementSurrounding(XYtoString(i, j));
            }
        }
    }
    // place event listeners
    step(id);
}

function incrementSurrounding(i, j) {
    adj = getAdjacentes(new Point(XYtoString(i, j)));
    for (let i = 0; i < adj.length; i++) {
        let e = adj[i];
        if (field[e.x][e.y] != -1) {
            field[e.x][e.y]++;
        }
    }

}

function setMine(i, j) {
    field[i][j] = -1;
    mines.set(XYtoString(i, j), false);
    minesNum++;
}

function disableField(bool) {
    for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++)
            document.getElementById(XYtoString(i, j)).disabled = bool;
}

function filler(id) {
    // on click on a zero, fint adjecant zeros and open them
    let adj = getAdjacentes(id);
    document.getElementById(id.pointToString()).innerHTML = '';
    if (state[id.x][id.y] == 1) {
        return;
    }
    state[id.x][id.y] = 1;

    document.getElementById(id.pointToString()).style.background = '#7dc26b';
    for (let k = 0; k < adj.length; k++) {
        let currentAdj = adj[k];
        let adjId = XYtoString(currentAdj.x, currentAdj.y);
        if (!FalseFlags.has(adjId))
            if (field[currentAdj.x][currentAdj.y] > 0) {
                state[currentAdj.x][currentAdj.y] += 1;
                let numIcon = newIcon(['fa-solid', 'fa-' + field[currentAdj.x][currentAdj.y]], id.pointToString() + 'm');
                let adjElement = document.getElementById(adjId);
                if (!adjElement.firstChild) {
                    adjElement.appendChild(numIcon);
                    document.getElementById(adjId).style.background = '#7dc26b';
                }
            } else if (field[currentAdj.x][currentAdj.y] == 0)
                filler(currentAdj);
    }
}

function getAdjacentes(p) {
    let res = [];

    for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
            if (i == 0 && j == 0) { continue; }
            if (!isOutOfBounds(new Point(XYtoString(p.x + i, p.y + j)))) {
                if (state[p.x + i][p.y + j] == 1) {
                    continue;
                }
                res.push(new Point(XYtoString(p.x + i, p.y + j)));
            }
        }
    }
    return res;
}


function isOutOfBounds(p) {
    if ((p.x >= 0 && p.x < height) && (p.y >= 0 && p.y < width))
        return false
    else
        return true
}

function revealMines() {
    for (let [key, value] of mines.entries()) {
        if (value == false) {
            let mineIcon = newIcon(['fa-solid', 'fa-bomb'], key + 'm');
            document.getElementById(key).appendChild(mineIcon);
        } else {
            let f = document.getElementById(key).firstChild;
            f.parentElement.removeChild(f);

            let checkIcon = newIcon(["fa-solid", "fa-check"], key + 'c')
            checkIcon.style.color = "green";
            document.getElementById(key).appendChild(checkIcon);
        }
    }
    for (let [key, value] of FalseFlags.entries()) {
        let f = document.getElementById(key).firstChild;
        f.parentElement.removeChild(f);

        let xIcon = newIcon(['fa-solid', 'fa-x'], key + 'x')
        xIcon.style.color = 'red';
        document.getElementById(key).appendChild(xIcon);
    }
}

function gameOver() {
    revealMines();
    let loseOverlay = document.getElementById('loseOverlayDiv');
    loseOverlay.style.display = 'block';
    firstClick = true;
    disableField(true);
}

function step(_id) {
    let id = _id.pointToString();

    if (field[_id.x][_id.y] == -1) {
        let mineIcon = newIcon(['fa-solid', 'fa-bomb'], id + 'm');
        mines.set(id, false);
        gameOver();
    } else if (field[_id.x][_id.y] == 0)
        filler(_id);
    else {
        let numIcon = newIcon(['fa-solid', 'fa-' + field[_id.x][_id.y]], id + 'm')
        if (!document.getElementById(id).firstChild) {
            document.getElementById(id).appendChild(numIcon);
            document.getElementById(XYtoString(_id.x, _id.y)).style.background = '#7dc26b';
        }
    }
}

function flag(_id) {
    let id = _id.pointToString();
    let flagImg = document.createElement('img');
    flagImg.setAttribute('id', id + 'f');
    flagImg.src = "media/flag 3.svg";
    var flagIconPointer = document.getElementById(id + 'f');
    if (firstClick)
        return;
    if (mines.has(id))
        //<i class="fa-solid fa-font-awesome"></i>
        if (mines.get(id)) {
            flagIconPointer.remove();
            mines.set(id, false);
        } else {
            mines.delete(id);
            document.getElementById(id).appendChild(flagImg);
            mines.set(id, true);
        }
    // style
    else if (FalseFlags.has(id)) {
        flagIconPointer.remove();
        FalseFlags.delete(id);
    } else if (!FalseFlags.has(id)) {
        document.getElementById(id).appendChild(flagImg);
        FalseFlags.set(id, true);
    }
    checkWin();

}

function checkWin() {
    let w = true;
    if (firstClick)
        return;
    for (const value of mines.values())
        if (value == false) {
            w = false;
            break;
        }
    if (mines.size == minesNum && FalseFlags.size == 0 && w) {
        let winOverlay = document.getElementById('winOverlayDiv');
        winOverlay.style.display = 'block';
    }
}

function click() {
    //right click
    document.querySelector('.button-table').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (e.target.matches('button') || e.target.matches('img')) {
            let _id = new Point(e.target.id);
            if (state[_id.x][_id.y] == 0)
                flag(_id);
        } else return;
    });
    //left click
    document.querySelector('.button-table').addEventListener('click', (e) => {
        if (e.target.matches('button') || e.target.matches('img')) {
            let id = new Point(e.target.id);
            if (FalseFlags.has(id.pointToString()) || mines.get(id.pointToString()) || state[id.x][id.y] > 0)
                return;
            else if (firstClick) {
                createField(id);
                firstClick = false;
            } else
                step(id);
        } else return;
    });
}

function resetState() {
    for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++)
            state[i][j] = 0;
}