/*
    Fritiof Rusck
    11 / 11 / 2020

    fritiof@rusck.se

    ============================

    A module to run A* pathfinding on the web


*/
export default class {
    constructor(board) {
        this.board = board; // Board is expected to be an array of arrays of booleans
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
    }

    setStart(x, y) {
        this.start = { x, y };
        return this;
    }

    setEnd(x, y) {
        this.end = { x, y };
        return this;
    }

    findPath() {
        // Get the start and end values, shorter to write startX instead of this.start.x
        const { x: startX, y: startY } = this.start; 
        const { x: endX, y: endY } = this.end;

        // Start with an open set with one input, the start node
        const openSet = {
            [`${startX}:${startY}`]: {
                x: startX,
                y: startY,
                gcost: 0,
                hcost: this.huristics(startX, startY),
                pointer: { x: startX, y: startY },
                explored: false
            }
        };

        while (openSet.length != 0) {
            const node = Object.values(openSet).reduce((current, item) => {
                if (!current) {  // If current is null, return this item since it's better than nothing
                    if (item.explored) {
                        return null
                    } else {
                        return item
                    }
                }

                if (this.getFcost(current) > this.getFcost(item) && item.huristics > current.huristics && !item.explored) {
                    return item;
                }
                return current;
            }, null); // Get the node with the best F cost and remove it from the open set

            if (node == null) break; // Couldn't find any nodes so path couldn't be found
            if (node.x == endX && node.y == endY) {
                const returnValue = [];
                let currentNode = node;

                while (true) {
                    returnValue.push([currentNode.x, currentNode.y]);
                    currentNode = openSet[`${currentNode.pointer.x}:${currentNode.pointer.y}`];
                    if(currentNode.x == startX && currentNode.y == startY) {
                        returnValue.push([currentNode.x, currentNode.y]);

                        return returnValue;
                    }
                }
            }

            // Set this nodes explore value to true since we've explored it now
            openSet[`${node.x}:${node.y}`].explored = true;

            // Loop trough all neighbours
            for (let x = node.x - 1; x < node.x + 2; x++) {
                for (let y = node.y - 1; y < node.y + 2; y++) {

                    // Logic to skip this iteration
                    if (y == 0 && x == 0) continue; // Skip if x and y is this node
                    if (x < 0 || x >= this.board.length || y < 0 || y >= this.board[0].length) continue; // skip if x and y is outside ov board bounderies
                    if (this.board[x][y]) continue; // If this position is unexplorable we skip it
                    if(
                        Math.abs(node.y - y) == Math.abs(node.x - x) &&
                        this.board[node.x][y] &&
                        this.board[x][node.y]
                    ) continue;

                    const gcost = (Math.abs(node.y - y) == Math.abs(node.x - x) ? Math.sqrt(2) : 1) + node.gcost;
                    const hcost = this.huristics(x, y);

                    if (`${x}:${y}` in openSet && gcost >= openSet[`${x}:${y}`].gcost) continue; // If we've already found this node and with a shorter path, keep that pointer

                    openSet[`${x}:${y}`] = {
                        x,
                        y,
                        gcost,
                        hcost,
                        pointer: { x: node.x, y: node.y },
                        explored: false
                    };
                }
            }
        }

        return null; // Couldn't find a path

    }

    // Private helper functions

    huristics = (x, y) => {
        // Calculates amount of steps to the end node
        const xD = Math.abs(this.end.x - x);
        const yD = Math.abs(this.end.y - y);

        const diagonallSteps = (yD > xD ? xD : yD);
        const straightSteps = Math.abs((xD > yD ? xD : yD) - diagonallSteps);

        return straightSteps + diagonallSteps * Math.sqrt(2);
    }

    // Increase code readability
    getFcost = ({ hcost, gcost }) => {
        return hcost + gcost;
    }
}