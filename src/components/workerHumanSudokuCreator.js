

//fibo.worker.js

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const numbersBasedOnDifficulty = {
        "Easy": {min: 34, max: 38},
        "Medium": {min: 28, max: 33},
        "Hard": {min: 0, max: 31}
    }

    const removeValueFromArray = (arraY, value)=> {
        for( let a = 0; a < arraY.length; a++){
            if ( arraY[a] === value) { 
                arraY.splice(a, 1); 
            }
        }
        return arraY
    }

    const containsObject = (list, obj) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true
            }
        }
        return false;
    }

    const getRandomNumber = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    class SudokuCreator {
        constructor(sudoku, difficulty) {
            this.newSudoku = sudoku;
            this.difficulty = difficulty
            this.numberListArranged = []
            this.numbers = sudoku
            this.known = 0
            this.potentialNumbers = []
            this.numberListArranged = [1,2,3,4,5,6,7,8,9]
            this.uniqueSolutions = 0
            
            for(let i=0; i<9; i++){
                this.potentialNumbers.push([])
                for(let j=0; j<9; j++){
                    this.potentialNumbers[i].push([])
                }
            }
        }

        async cleanPossibilities(){
            for(let i=0; i<9; i++){
                for(let j=0; j<9; j++){
                    this.potentialNumbers[i][j] = []
                }
            }
        }

        async createSudoku(){
            let newCreatedSudoku = [];
            for (let i = 0; i < this.newSudoku.length; i++){
                newCreatedSudoku[i] = this.newSudoku[i].slice();
            }  

            let removeValueFromArrayNumbers = []
            let X_to_removeValueFromArray = 0
            let Y_to_removeValueFromArray = 0
            let known = 81
            let a = 0
            let lastSudokuFulfilsHardRequirement = false

            while(a<10000){
                if(known < numbersBasedOnDifficulty[this.difficulty].min){
                    break
                }

                a += 1
                while(true){
                X_to_removeValueFromArray = getRandomNumber(0,9)
                Y_to_removeValueFromArray = getRandomNumber(0,9)
                    if(newCreatedSudoku[X_to_removeValueFromArray][Y_to_removeValueFromArray] !== 0){
                        removeValueFromArrayNumbers.push({
                            x: X_to_removeValueFromArray,
                            y: Y_to_removeValueFromArray, 
                            number: newCreatedSudoku[X_to_removeValueFromArray][Y_to_removeValueFromArray]
                        })
                        newCreatedSudoku[X_to_removeValueFromArray][Y_to_removeValueFromArray] = 0

                        known -= 1
                        break
                    }
                }   
                let copyArray = []
                for (let i = 0; i < newCreatedSudoku.length; i++){
                    copyArray[i] = newCreatedSudoku[i].slice();
                }

                let solvable = await this.checkIfSolvable(copyArray)
                
                if(solvable.solved) {
                    lastSudokuFulfilsHardRequirement = solvable.hardMode
                    continue
                }

                const difficultyRequirementsNotFulfilled = !lastSudokuFulfilsHardRequirement && this.difficulty === "Hard"

                if(!difficultyRequirementsNotFulfilled && known<numbersBasedOnDifficulty[this.difficulty].max){ 
                    newCreatedSudoku[X_to_removeValueFromArray][Y_to_removeValueFromArray] = removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].number
                    solvable = true
                    break
                }
        
                for(let j=0; j<3; j++){
                    known += 1
                    newCreatedSudoku[removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].x][removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].y] = removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].number
                    removeValueFromArrayNumbers.pop()             
                }
        
            }
            let newSudoku = [];

            for (let i = 0; i < newCreatedSudoku.length; i++){
                newSudoku[i] = newCreatedSudoku[i].slice();
            }

            postMessage(newSudoku);
        }

        async checkIfSolvable(sudoku){
           await this.cleanPossibilities()
           this.baseInfo(sudoku)
           const result = await this.getPossibilities(sudoku)

           return result
        }

        async updates(x, y, number){
            this.potentialNumbers[x][y] = []
            this.known += 1
            for (let i = 0; i < 9; i++) {
                this.potentialNumbers[x][i] = removeValueFromArray(this.potentialNumbers[x][i], number)
                this.potentialNumbers[i][y] = removeValueFromArray(this.potentialNumbers[i][y], number)
            }
           
            let squareEdges = [0, 0, 0, 0]
            
            squareEdges[0] = (x + 3) % 3  
            squareEdges[1] = (y + 3) % 3
            squareEdges[0] = x + 1 - squareEdges[0]
            squareEdges[1] = y + 1 - squareEdges[1]
            squareEdges[2] = squareEdges[1] + 3
            squareEdges[3] = squareEdges[0] + 3
            
            for (let i = squareEdges[0]; i < squareEdges[3]; i++) {
                for (let j = squareEdges[1]; j < squareEdges[2]; j++) {
                    for( let a = 0; a < this.potentialNumbers[i-1][j-1].length; a++){ 
                        if ( this.potentialNumbers[i-1][j-1][a] === number) { 
                            this.potentialNumbers[i-1][j-1].splice(a, 1); 
                        }            
                    }
                }
            }
            return
        }
        
        async getPossibilities(sudoku) {
            let canNumberBeThere;
            
            let squareEdges = [0, 0, 0, 0]
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 9; y++) {
                    if (sudoku[x][y] !== 0) continue
                    for (let a = 1; a < 10; a++) {
                        canNumberBeThere = false
                        for (let b = 0; b < 9; b++) {
                            if (sudoku[x][b] === a || sudoku[b][y] === a) {
                                canNumberBeThere = true
                                break
                            }
                            squareEdges[0] = (x + 3) % 3
                            squareEdges[1] = (y + 3) % 3
                            squareEdges[0] = x - squareEdges[0]
                            squareEdges[1] = y - squareEdges[1]
                            squareEdges[2] = squareEdges[1] + 3
                            squareEdges[3] = squareEdges[0] + 3
                            for (let i = squareEdges[0]; i < squareEdges[3]; i++) {
                                for (let j = squareEdges[1]; j < squareEdges[2]; j++) {
                                    if (sudoku[i][j] === a) {
                                        canNumberBeThere = true
                                        break
                                    }
                                }
                            }
                        }
                        if(canNumberBeThere === true) continue
                        this.potentialNumbers[x][y].push(a)
                        
                    } 
                }
            }

            await this.solo(sudoku)
            const result = await this.solving(sudoku)
            return result
        }

        baseInfo(sudoku) {
            this.known = 0;
            for (let i = 0; i < 9; i++) {
                for (let a = 0; a < 9; a++) {
                    if (sudoku[i][a] !== 0) {
                        this.known += 1 // needed for later to check if there is any progress
                    }
                }
            }
        }
    
        async solo(sudoku){
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 9; y++) {
                    if (this.potentialNumbers[x][y].length === 1){
                        sudoku[x][y] = this.potentialNumbers[x][y][0]
                        
                        this.updates(x, y, this.potentialNumbers[x][y][0])
                    }     
                }
            }      
        }
    
        async solving(sudoku) {
            let toRepeat = 0
            let hardMode = false
            while (this.known < 81){
                let baseKnown = this.known
                
                for (let a = 1; a < 10; a++) {
                    for (let x = 0; x < 9; x++) {
                        let temp_c = [0, 0, 0]
                        let temp_d = [0, 0, 0]
                        
                        for (let y = 0; y < 9; y++) {
                            
                            if(containsObject(this.potentialNumbers[x][y], a)){
                                temp_c[0] = temp_c[0] + 1
                                temp_c[1] = x
                                temp_c[2] = y
                            }  
                            
                            if(containsObject(this.potentialNumbers[y][x], a)){
                                    temp_d[0] = temp_d[0] + 1
                                    temp_d[1] = y
                                    temp_d[2] = x
                            }           
                        }
                        
                        if(temp_c[0] === 1){
                            sudoku[temp_c[1]][temp_c[2]] = a
                            this.updates(temp_c[1], temp_c[2], a)
                        }
                        
                        if(temp_d[0] === 1){
                            if(temp_d[1]!==temp_d[2]){   //Since We are checking both rows and columns, in situation when x and y are the same we set number two times
                                sudoku[temp_d[1]][temp_d[2]] = a
                                this.updates(temp_d[1], temp_d[2], a)
                            }
                        }
                    }
                    for (let x = 1; x < 4; x++) {
                        for (let y = 1; y < 4; y++) {
                            
                            let temp_c = [0, 0, 0]
                            let squareEdges = [0, 0, 0, 0]
                            
                            squareEdges[0] = (x - 1) * 3 + 1 
                            squareEdges[1] = (y - 1) * 3 + 1
                            squareEdges[2] = (x - 1) * 3 + 4
                            squareEdges[3] = (y - 1) * 3 + 4
                            
                            for (var i = squareEdges[0]; i < squareEdges[3]; i++) {
                                for (var j = squareEdges[1]; j < squareEdges[2]; j++) {
                                    if(containsObject(this.potentialNumbers[i-1][j-1], a)){
                                        temp_c[0] = temp_c[0] + 1
                                        temp_c[1] = i - 1
                                        temp_c[2] = j - 1
                                    }
                                }
                            }    
                            if(temp_c[0] === 1){
                                sudoku[temp_c[1]][temp_c[2]] = a        
                                this.updates(temp_c[1], temp_c[2], a)
                            }
                        }
                    }
                }
    
                await this.solo(sudoku)            
                if (baseKnown === this.known){
                    toRepeat = toRepeat + 1
                    hardMode = true
                    await this.hard()
                }
                if( toRepeat === 10){
                    return {solved: false, hardMode}
                }
            }
  
            return {solved: true, hardMode}
        }

        async hard(){
            for (let a = 1; a < 10; a++) {
                for (let x = 1; x < 4; x++) {
                    for (let y = 1; y < 4; y++) {      
                        
                        let squareEdges = [0, 0, 0, 0]
                        let howManyNumbers = 0
                        let blockadeX = true
                        let blockadeY = true
                        let whatX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        let whatY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        
                        squareEdges[0] = (x - 1) * 3 + 1 
                        squareEdges[1] = (y - 1) * 3 + 1
                        squareEdges[2] = (x - 1) * 3 + 4
                        squareEdges[3] = (y - 1) * 3 + 4
                        
                        for (var i = squareEdges[0]; i < squareEdges[3]; i++) { //c
                            for (var j = squareEdges[1]; j < squareEdges[2]; j++) { //d
                                
                                if(!containsObject(this.potentialNumbers[i-1][j-1], a)) continue
                                
                                whatX[howManyNumbers] = i - 1
                                whatY[howManyNumbers] = j - 1
                                howManyNumbers = howManyNumbers + 1
                                
                                if(howManyNumbers > 1){
                                    if (whatX[howManyNumbers-2] !== whatX[howManyNumbers - 1]){
                                        blockadeX = false
                                    }
                                    if (whatY[howManyNumbers-2] !== whatY[howManyNumbers - 1]){
                                        blockadeY = false
                                    }
                                }
                            }
                        }
                        
                        let doesNumberHavePossibleTilesOnlyWithSameXInSquare = blockadeX === true && howManyNumbers > 0
                        if (doesNumberHavePossibleTilesOnlyWithSameXInSquare){
                            for (let d = 0; d < 9; d++){
                                let numbersIsPossibilityInTileWhichIsNotInTheSameSquare = containsObject(this.potentialNumbers[whatX[0]][d], a)
                                && ! containsObject(whatY,d)
                                if(numbersIsPossibilityInTileWhichIsNotInTheSameSquare){
                                    this.potentialNumbers[whatX[0]][d] = removeValueFromArray(this.potentialNumbers[whatX[0]][d], a)
                                }
                            }
                        }
                        
                        let doesNumberHavePossibleTilesOnlyWithSameYInSquare = blockadeY === true && howManyNumbers > 0
                        if(doesNumberHavePossibleTilesOnlyWithSameYInSquare){  
                            for (let d = 0; d < 9; d++){
                                
                                let numbersIsPossibilityInTileWhichIsNotInTheSameSquare = containsObject(this.potentialNumbers[d][whatY[0]], a)
                                    && !containsObject(whatX,d)
                                if(numbersIsPossibilityInTileWhichIsNotInTheSameSquare){ 
                                    this.potentialNumbers[d][whatY[0]] = removeValueFromArray(this.potentialNumbers[d][whatY[0]], a)                
                                }
                            }
                        }
                    }
                }
            }
            for (let a = 1; a < 10; a++) {  
                for (let x = 0; x < 9; x++) {
                    
                    let squareEdges = [0, 0, 0, 0]
                    let howManyNumbers = 0
                    let blockadeY = true
                    let whatY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    
                    for (let y = 0; y < 9; y++) {
                        
                        if(!containsObject(this.potentialNumbers[x][y], a)) continue
                        
                        whatY[howManyNumbers] = y
                        howManyNumbers = howManyNumbers + 1
                        
                        if (howManyNumbers > 1){
                           
                            squareEdges[0] = (whatY[howManyNumbers - 1] + 3) % 3
                            squareEdges[1] = (whatY[howManyNumbers - 2] + 3) % 3  // checking if both numbers belong to the same square
                            squareEdges[0] = whatY[howManyNumbers - 1]  - squareEdges[0]
                            squareEdges[1] = whatY[howManyNumbers - 2]  - squareEdges[1]
                           
                            if (squareEdges[1] !== squareEdges[0]){
                                blockadeY = false
                                break
                            }
                        }
                    }
                    let doesNumberHavePossibleTilesInOneSquareInColumn = blockadeY === true && howManyNumbers > 0
                    if (doesNumberHavePossibleTilesInOneSquareInColumn){
                        
                        squareEdges[0] = (x + 3) % 3
                        squareEdges[1] = (whatY[0] + 3) % 3
                        squareEdges[0] = x - squareEdges[0]
                        squareEdges[1] = whatY[0] - squareEdges[1]  // finding beggining of og square of x and y
                        squareEdges[2] = squareEdges[1] + 3
                        squareEdges[3] = squareEdges[0] + 3
                        
                        for (let c = squareEdges[0]; c < squareEdges[3]; c++){ // removeValueFromArrays pos from square
                            for (let d = squareEdges[1]; d < squareEdges[2]; d++){  
                                if(containsObject(this.potentialNumbers[c][d], a) && !containsObject(whatY, d)){                          
                                    this.potentialNumbers[c][d] = removeValueFromArray(this.potentialNumbers[c][d], a)
                                }
                            }
                        }
                    }
                }
            } // this loop and next should be created to function somehow
            for (let a = 1; a < 10; a++) { 
                for (let y = 0; y < 9; y++) { 
                    
                    let squareEdges = [0, 0, 0, 0]
                    let howManyNumbers = 0
                    let blockadeX = true
                    let whatX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    
                    for (let x = 0; x < 9; x++) {
                        if(!containsObject(this.potentialNumbers[x][y], a)) continue
                        
                        whatX[howManyNumbers] = x
                        howManyNumbers = howManyNumbers + 1
                        
                        if (howManyNumbers > 1){
                            
                            squareEdges[0] = (whatX[howManyNumbers - 1] + 3) % 3  // checking if both numbers belong to the same square
                            squareEdges[1] = (whatX[howManyNumbers - 2] + 3) % 3
                            squareEdges[0] = whatX[howManyNumbers - 1]  - squareEdges[0]
                            squareEdges[1] = whatX[howManyNumbers - 2]  - squareEdges[1]
                            
                            if (squareEdges[1] !== squareEdges[0]){
                                blockadeX = false
                                break
                            }
                        }
                    }
                    let doesNumberHavePossibleTilesInOneSquareInRow = blockadeX === true && howManyNumbers > 0
                    if (doesNumberHavePossibleTilesInOneSquareInRow){
                        
                        squareEdges[0] = (whatX[0] + 3) % 3
                        squareEdges[1] = y -(y + 3) % 3
                        squareEdges[0] = whatX[0] - squareEdges[0]  
                        squareEdges[2] = squareEdges[1] + 3
                        squareEdges[3] = squareEdges[0] + 3
                        
                        for (let c = squareEdges[0]; c < squareEdges[3]; c++){ // removeValueFromArrays pos from square
                            for (let d = squareEdges[1]; d < squareEdges[2]; d++){
                                
                                if(containsObject(this.potentialNumbers[c][d], a) && !containsObject(whatX, d)){
                                                                  
                                    this.potentialNumbers[c][d] = removeValueFromArray(this.potentialNumbers[c][d], a)
                                    return
                                }
                            }
                        }
                    }
                }
            }
            return
        }      
    }
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = function(e){
        const sudoku = new SudokuCreator(e.data.sudoku, e.data.difficulty)
        sudoku.createSudoku()
    }
}
  