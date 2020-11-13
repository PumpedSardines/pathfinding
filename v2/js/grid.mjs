export default class {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.sizeX = x;
        this.sizeY = y;
        this.gridSize = 0;

        this.blocks = {};

        this.mouseDown = false;
        this.click = true;
        this.downMousePos = null;
        this.lastGridPos = null;
        this.downGridPos = null;
        this.mode = "remove";

        this.runFunc = () => { };
        this.renderFunc = () => { };

        this.canvas.addEventListener("mousedown", e => {
            this.mouseDown = true;
            this.click = true;
            const { x, y, xPos, yPos } = this.getBoardPos(e);
            this.downGridPos = { x: xPos, y: yPos };
            this.lastGridPos = { x: xPos, y: yPos };
            this.downMousePos = { x, y };

            if (this.getKey(xPos, yPos) in this.blocks) {
                this.mode = this.blocks[this.getKey(xPos, yPos)].moveable ? "move" : "remove";
            } else {
                this.mode = "add";
            }
        })

        window.addEventListener("mouseup", () => {
            this.mouseDown = false;
            const { x, y } = this.lastGridPos;
            const node = this.blocks[this.getKey(x, y)];


            if (this.click && node && node.removeable) {
                delete this.blocks[this.getKey(x, y)];
                this.render();
            } else if (this.click) {
                this.mode = "add"
                this.runFunc({
                    mode: this.mode,
                    add: (obj, onMove = () => { }) => {
                        this.addBlock(x, y, obj, onMove);
                        this.render();
                    },
                    remove: () => {
                        if (this.getKey(x, y) in this.blocks && this.blocks[this.getKey(x, y)].removeable) {
                            delete this.blocks[this.getKey(x, y)];
                            this.render();
                        }
                    }
                });
            }
        })

        this.canvas.addEventListener("mousemove", e => {
            if (!this.mouseDown) return;
            const { x: mouseX, y: mouseY, xPos, yPos } = this.getBoardPos(e);
            const { x: startX, y: startY } = this.downMousePos;
            const { x: lastX, y: lastY } = this.lastGridPos;

            if (this.click && Math.sqrt((x - startX) ** 2 + (y - startY) ** 2) > 1) {
                this.click = false;
            }

            if (!this.click) {
                switch (this.mode) {
                    case "move":
                        let closestX = 0;
                        let closestY = 0;
                        if (!(this.getKey(xPos, yPos) in this.blocks) || (xPos == lastX && yPos == lastY)) {
                            closestX = xPos;
                            closestY = yPos;
                        } else {
                            return;
                            let foundOne = false;
                            let currentClosest = Infinity;
                            for (let x = -1; x < 2; x++)
                                for (let y = -1; y < 2; y++) {
                                    if (x == 0 && y == 0) continue;
                                    const cY = yPos + y;
                                    const cX = xPos + x;
                                    if (this.getKey(cX, cY) in this.blocks && cX != lastX && cY != lastY) continue;
                                    if (cY < 0 || cY >= this.sizeY || cX < 0 || cX >= this.sizeX) continue;

                                    

                                    const distance = Math.sqrt(
                                        ((cX * this.gridSize + (this.gridSize / 2)) - mouseX) ** 2 +
                                        ((cY * this.gridSize + (this.gridSize / 2)) - mouseY) ** 2
                                    );


                                    foundOne = true;
                                    if (currentClosest > distance) {
                                        currentClosest = distance;
                                        closestX = cX;
                                        closestY = cY;
                                    }

                                }

                            if (!foundOne) {
                                return;
                            }
                        }
                        console.log(lastX,lastY)

                        const node = this.blocks[this.getKey(lastX, lastY)];

                        if (node.moveable) {
                            delete this.blocks[this.getKey(lastX, lastY)];
                            node.x = closestX;
                            node.y = closestY;
                            this.blocks[this.getKey(closestX, closestY)] = node;
                            node.onMove();
                            this.render();
                        }
                        this.lastGridPos = { x: closestX, y: closestY };
                        break;
                    case "remove":
                    case "add":
                        this.runFunc({
                            mode: this.mode,
                            add: (obj, onMove = () => { }) => {
                                this.addBlock(xPos, yPos, obj, onMove);
                                this.render();
                            },
                            remove: () => {
                                if (this.getKey(xPos, yPos) in this.blocks && this.blocks[this.getKey(xPos, yPos)].removeable) {
                                    delete this.blocks[this.getKey(xPos, yPos)];
                                    this.render();
                                }
                            }
                        });
                        break;
                }
            }
        });

        this.reCalculateSize().render();

        window.addEventListener("resize", () => {
            this.reCalculateSize().render();
        })
    }

    onRender(func) {
        this.renderFunc = func;
        return this;
    }

    onRun(func) {
        this.runFunc = func;
        return this;
    }

    reCalculateSize() {
        const minWindowSize = (window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth) * .8;
        this.gridSize = minWindowSize / (this.sizeY < this.sizeX ? this.sizeX : this.sizeY);

        this.canvas.width = this.gridSize * this.sizeX;
        this.canvas.height = this.gridSize * this.sizeY;
        return this;
    }

    addBlock(x, y, { name = "generic", priority = 0, color, moveable, removeable }, onMove = () => { }) {
        if (!(this.getKey(x, y) in this.blocks)) {
            this.blocks[this.getKey(x, y)] = {
                x,
                y,
                name,
                color,
                priority,
                moveable,
                removeable,
                onMove
            }
        }
        return this;
    }

    render(gridcolor = "white", stroke = "black") {
        const { ctx, canvas, board, gridSize } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = .2
        ctx.strokeStyle = stroke;

        for (let x = 0; x < this.sizeX; x++) {
            for (let y = 0; y < this.sizeY; y++) {
                ctx.beginPath()
                ctx.fillStyle = gridcolor;
                ctx.rect(x * gridSize, y * gridSize, gridSize, gridSize);
                ctx.fill();
                ctx.stroke();
            }
        }

        const lines = this.renderFunc(this.getBoard(this.blocks, this.sizeX, this.sizeY));


        if (lines) {

            for (const line of lines) {
                if (line.path == null) {
                    continue;
                }
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.lineWidth = 10

                const firstPoint = line.path.shift();

                ctx.moveTo(firstPoint[0] * gridSize + gridSize / 2, firstPoint[1] * gridSize + gridSize / 2);
                for (const pathPoint of line.path) {
                    ctx.lineTo(pathPoint[0] * gridSize + gridSize / 2, pathPoint[1] * gridSize + gridSize / 2);
                }
                ctx.stroke();
            }
        }

        for (const node of Object.values(this.blocks)) {
            ctx.beginPath()
            const { color } = node;
            ctx.fillStyle = color;
            ctx.fillRect(node.x * gridSize, node.y * gridSize, gridSize, gridSize);
        }

    }


    // Helper functions to increase code quality and readability
    // note - All of these should be pure functions
    getKey = (x, y) => {
        return `${x}:${y}`;
    }

    getBoard = (blocks, sizeX, sizeY) => {
        let returnArray = [];
        for (let x = 0; x < sizeX; x++) {
            returnArray.push([]);
            for (let y = 0; y < sizeY; y++) {
                if (this.getKey(x, y) in blocks) {
                    returnArray[x].push(blocks[this.getKey(x, y)].name)
                } else {
                    returnArray[x].push(null);
                }

            }
        }
        return returnArray;
    }

    getBoardPos = e => {
        let x, y;

        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;

        let xPos = Math.floor(x / this.gridSize);
        let yPos = Math.floor(y / this.gridSize);

        xPos = this.sizeX <= xPos ? this.sizeX - 1 : xPos;
        yPos = this.sizeY <= yPos ? this.sizeY - 1 : yPos;

        return { x, y, xPos, yPos };
    }
}