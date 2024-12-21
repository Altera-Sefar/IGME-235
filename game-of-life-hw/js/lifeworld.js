const lifeworld = {
    init(numCols, numRows) {
        this.numCols = numCols,
        this.numRows = numRows,
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },

    buildArray() {
        let outerArray = [];
        for (let row = 0; row < this.numRows; row++) {
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++) {
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },

    randomSetup() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.world[row][col] = 0
                if (Math.random() < .1) {
                    this.world[row][col] = 1;
                }
            }
        }
    },

    getLivingNeighbors(row, col) {
        // TODO:
        // row and col should > than 0, if not return 0
        if(row <= 0 || col <= 0){
            return 0
        }
        // row and col should be < the length of the applicable array, minus 1. If not return 0
        if(row >= this.numRows - 1 || col >= this.numCols)
        {
            return 0
        }
        // count up how many neighbors are alive at N,NE,E,SE,S,SW,W,SE - use this.world[row][col-1] etc
        let cellsAlive = 0;

        if(this.world[row - 1][col - 1] == 1){
            cellsAlive++;
        }
        if(this.world[row - 1][col] == 1){
            cellsAlive++;
        }
        if(this.world[row - 1][col + 1] == 1){
            cellsAlive++;
        }
        if(this.world[row][col - 1] == 1){
            cellsAlive++;
        }
        if(this.world[row][col + 1] == 1){
            cellsAlive++;
        }
        if(this.world[row + 1][col - 1] == 1){
            cellsAlive++;
        }
        if(this.world[row + 1][col] == 1){
            cellsAlive++;
        }
        if(this.world[row + 1][col + 1] == 1){
            cellsAlive++;
        }
        return cellsAlive
    },

    step() {
        // TODO:

        // nested for loop will call getLivingNeighbors() on each cell in this.world
        // Determine if that cell in the next generation should be alive (see wikipedia life page linked at top)
        // Put a 1 or zero into the right location in this.worldBuffer
        // when the looping is done, swap .world and .worldBuffer (use a temp variable to do so)
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let cellsAlive = this.getLivingNeighbors(row, col);
                if(cellsAlive < 2 && this.world[row][col] == 1){
                    this.world[row][col] = 0;
                }
                if((cellsAlive == 2 || cellsAlive == 3) && this.world[row][col] == 1){
                    this.world[row][col] = 1;
                }
                if(cellsAlive > 3 && this.world[row][col] == 1){
                    this.world[row][col] = 0;
                }
                if(cellsAlive == 3 && this.world[row][col] == 0){
                    this.world[row][col] = 1;
                }
            }
        }
    }
}