import Astar from './astar.mjs';


class AstarRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.board = new Array(0).fill(0).map(v => new Array(0).fill(false));
        this.start = { x: 0, y: 0 }
        this.end = { x: 0, y: 0 }
        this.path = [];
        this.gridSize = 0;

        window.addEventListener("resize", () => { this.reCalculateSize() });
    }

    setStart(x, y) {
        if(this.end.x == x && this.end.y == y) return this;
        if(this.board[x][y]) return this;
        this.start = { x, y };
        return this;
    }

    setEnd(x, y) {
        if(this.start.x == x && this.start.y == y) return this;
        if(this.board[x][y]) return this;
        this.end = { x, y };
        return this;
    }

    setObstacle(x, y, set = true) {
        if(this.start.x == x && this.start.y == y) return this;
        if(this.end.x == x && this.end.y == y) return this;
        this.board[x][y] = set;
        return this;
    }

    reCalculatePath() {
        this.path = new Astar(this.board)
            .setStart(this.start.x, this.start.y)
            .setEnd(this.end.x, this.end.y)
            .findPath();
        return this;
    }

    reCalculateSize() {
        const minWindowSize = (window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth) * .8;
        this.gridSize = minWindowSize / (this.board[0].length < this.board.length ? this.board.length : this.board[0].length);

        cavnas.width = this.gridSize * this.board.length;
        cavnas.height = this.gridSize * this.board[0].length;
        this.render()
        return this;
    }

    setBoard(x, y) {
        this.start = { x: 0, y: 0 };
        this.end = { x: x - 1, y: y - 1 };
        this.board = new Array(x).fill(0).map(v => new Array(y).fill(false));
        this.path = new Astar(this.board)
            .setStart(this.start.x, this.start.y)
            .setEnd(this.end.x, this.end.y)
            .findPath();
        this.reCalculateSize();

        return this;
    }

    render() {
        const { ctx, canvas, board, start, end, path, gridSize } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = .2
        ctx.strokeStyle = "#324586";

        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[0].length; y++) {

                ctx.beginPath()
                if (board[x][y]) {
                    ctx.fillStyle = "#324586"
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                }
                else if (x == start.x && y == start.y) {
                    ctx.fillStyle = "#97D8C4"
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                }
                else if (x == end.x && y == end.y) {
                    ctx.fillStyle = "#F4B942"
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                } else {
                    ctx.fillStyle = "#fff"
                    ctx.rect(x * gridSize, y * gridSize, gridSize, gridSize);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        if (path) {
            ctx.beginPath();
            ctx.strokeStyle = "#6B9AC4";
            ctx.lineWidth = 10
            ctx.moveTo(end.x * gridSize + gridSize / 2, end.y * gridSize + gridSize / 2);
            for (const pathPoint of path) {
                ctx.lineTo(pathPoint[0] * gridSize + gridSize / 2, pathPoint[1] * gridSize + gridSize / 2);
            }
            ctx.stroke();
            
        }
    }
}

const cavnas = document.querySelector("#canvas");
const grid = new AstarRenderer(cavnas).setBoard(16, 16);
grid.render();

let mouseDown = false;

let mode = "place-obstacle";

function executeBasedOnMode(x, y) {
    switch (mode) {
        case "place-obstacle":
            grid.setObstacle(x, y).reCalculatePath().render();
            break;
        case "remove-obstacle":
            grid.setObstacle(x, y, false).reCalculatePath().render();
            break;
        case "place-start":
            grid.setStart(x, y).reCalculatePath().render();
            break;
        case "place-end":
            grid.setEnd(x, y, false).reCalculatePath().render();
            break;

    }
}

function getBoardPosition(e) {
    let x, y;

    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= grid.canvas.offsetLeft;
    y -= grid.canvas.offsetTop;

    const xPos = Math.floor(x / grid.gridSize);
    const yPos = Math.floor(y / grid.gridSize);

    return { xPos, yPos };
}

grid.canvas.addEventListener("mousedown", e => {
    mouseDown = true;
    const { xPos, yPos } = getBoardPosition(e);
    executeBasedOnMode(xPos, yPos);
})

window.addEventListener("mouseup", () => {
    mouseDown = false;
})

grid.canvas.addEventListener("mousemove", e => {
    console.log(mode)
    if (!mouseDown) return;
    const { xPos, yPos } = getBoardPosition(e);
    executeBasedOnMode(xPos, yPos);
});




const buttonsContainer = document.querySelector("#buttons");
buttonsContainer.style.width = `${grid.canvas.width}px`;
window.addEventListener("resize", () => {
    buttonsContainer.style.width = `${grid.canvas.width}px`;
});


const placeObstacleButton = document.querySelector("#place-obstacle");
const removeObstacleButton = document.querySelector("#remove-obstacle");
const placeStartButton = document.querySelector("#place-start");
const placeEndButton = document.querySelector("#place-end");

[
    {
        ele: placeObstacleButton,
        mode: "place-obstacle"
    },
    {
        ele: removeObstacleButton,
        mode: "remove-obstacle"
    },
    {
        ele: placeStartButton,
        mode: "place-start"
    },
    {
        ele: placeEndButton,
        mode: "place-end"
    }
].forEach(({ ele, mode: m }) => {
    ele.addEventListener("click", e => {
        [placeObstacleButton, removeObstacleButton, placeStartButton, placeEndButton]
            .forEach(element => element.classList.remove("selected"));
        ele.classList.add("selected");

        mode = m;
    })
})