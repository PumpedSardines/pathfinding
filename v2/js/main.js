import Grid from './grid.mjs';
import Astar from './astar.mjs';

const canvas = document.querySelector("canvas");

const grid = new Grid(canvas, 15, 15)
    .addBlock(4, 7, {
        name: "start",
        color: "#97D8C4",
        moveable: true,
        removeable: false,
    })
    .addBlock(10, 7, {
        name: "end",
        color: "#F4B942",
        moveable: true,
        removeable: false,
    })
    .onRun(({ add, remove, mode }) => {
        switch (mode) {
            case "remove":
                remove();
                break;
            case "add":
                add({
                    name: "block",
                    color: "#324586",
                    moveable: false,
                    removeable: true
                });
                break;
        }
    })
    .onRender((board) => {

        let start = {};
        let end = {};
        const grid = new Array(board.length).fill(0).map(_ => new Array(board[0].length).fill(false));

        for (let x = 0; x < board.length; x++)
            for (let y = 0; y < board[0].length; y++) {
                switch (board[x][y]) {
                    case "start":
                        start = { x, y }
                        break;
                    case "end":
                        end = { x, y }
                        break;
                    case "block":
                        grid[x][y] = true;
                        break;
                }
            }


        const path = new Astar(grid)
            .setStart(start.x, start.y)
            .setEnd(end.x, end.y)
            .findPath();

            console.log(path);


        return [{
            color: "#6B9AC4",
            path: path
        }];
    })
    .render();