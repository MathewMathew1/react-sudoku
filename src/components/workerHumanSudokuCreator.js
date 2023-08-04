

//fibo.worker.js

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = function(e){
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
    
        let difficulty = e.data.difficulty
        let known = 0
        let potentialNumbers = []
        
        for(let i=0; i<9; i++){
            potentialNumbers.push([])
            for(let j=0; j<9; j++){
                potentialNumbers[i].push([])
            }
        }
        

        const cleanPossibilities = () =>{
            for(let i=0; i<9; i++){
                for(let j=0; j<9; j++){
                    potentialNumbers[i][j] = []
                }
            }
        }

        const createSudoku = () => {
            let newCreatedSudoku = [];
            for (let i = 0; i < e.data.sudoku.length; i++){
                newCreatedSudoku[i] = e.data.sudoku[i].slice();
            }  

            let removeValueFromArrayNumbers = []
            let X_to_removeValueFromArray = 0
            let Y_to_removeValueFromArray = 0
            let known = 81
            let a = 0
            let lastSudokuFulfilsHardRequirement = false

            while(a<10000){
                if(known < numbersBasedOnDifficulty[difficulty].min){
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

                let solvable =  checkIfSolvable(copyArray)
                
                if(solvable.solved) {
                    lastSudokuFulfilsHardRequirement = solvable.hardMode
                    continue
                }

                const difficultyRequirementsNotFulfilled = !lastSudokuFulfilsHardRequirement && difficulty === "Hard"

                if(!difficultyRequirementsNotFulfilled && known<numbersBasedOnDifficulty[difficulty].max){ 
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

        const checkIfSolvable =  (sudoku) => {
            cleanPossibilities()
            baseInfo(sudoku)
            const result =  getPossibilities(sudoku)

            return result
        }

        const updates =  (x, y, number) => {
            potentialNumbers[x][y] = []
            known += 1
            for (let i = 0; i < 9; i++) {
                potentialNumbers[x][i] = removeValueFromArray(potentialNumbers[x][i], number)
                potentialNumbers[i][y] = removeValueFromArray(potentialNumbers[i][y], number)
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
                    for( let a = 0; a < potentialNumbers[i-1][j-1].length; a++){ 
                        if ( potentialNumbers[i-1][j-1][a] === number) { 
                            potentialNumbers[i-1][j-1].splice(a, 1); 
                        }            
                    }
                }
            }
            return
        }
        
        const getPossibilities =  (sudoku) =>  {
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
                        potentialNumbers[x][y].push(a)
                        
                    } 
                }
            }

             solo(sudoku)
            const result =  solving(sudoku)
            return result
        }

        const baseInfo =  (sudoku) => {
            known = 0;
            for (let i = 0; i < 9; i++) {
                for (let a = 0; a < 9; a++) {
                    if (sudoku[i][a] !== 0) {
                        known += 1 // needed for later to check if there is any progress
                    }
                }
            }
        }
    
        const solo =  (sudoku) => {
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 9; y++) {
                    if (potentialNumbers[x][y].length === 1){
                        sudoku[x][y] = potentialNumbers[x][y][0]
                        
                        updates(x, y, potentialNumbers[x][y][0])
                    }     
                }
            }      
        }
    
        const solving =  (sudoku) => {
            let toRepeat = 0
            let hardMode = false
            while (known < 81){
                let baseKnown = known
                
                for (let a = 1; a < 10; a++) {
                    for (let x = 0; x < 9; x++) {
                        let temp_c = [0, 0, 0]
                        let temp_d = [0, 0, 0]
                        
                        for (let y = 0; y < 9; y++) {
                            
                            if(containsObject(potentialNumbers[x][y], a)){
                                temp_c[0] = temp_c[0] + 1
                                temp_c[1] = x
                                temp_c[2] = y
                            }  
                            
                            if(containsObject(potentialNumbers[y][x], a)){
                                    temp_d[0] = temp_d[0] + 1
                                    temp_d[1] = y
                                    temp_d[2] = x
                            }           
                        }
                        
                        if(temp_c[0] === 1){
                            sudoku[temp_c[1]][temp_c[2]] = a
                            updates(temp_c[1], temp_c[2], a)
                        }
                        
                        if(temp_d[0] === 1){
                            if(temp_d[1]!==temp_d[2]){   //Since We are checking both rows and columns, in situation when x and y are the same we set number two times
                                sudoku[temp_d[1]][temp_d[2]] = a
                                updates(temp_d[1], temp_d[2], a)
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
                                    if(containsObject(potentialNumbers[i-1][j-1], a)){
                                        temp_c[0] = temp_c[0] + 1
                                        temp_c[1] = i - 1
                                        temp_c[2] = j - 1
                                    }
                                }
                            }    
                            if(temp_c[0] === 1){
                                sudoku[temp_c[1]][temp_c[2]] = a        
                                updates(temp_c[1], temp_c[2], a)
                            }
                        }
                    }
                }
    
                 solo(sudoku)            
                if (baseKnown === known){
                    toRepeat = toRepeat + 1
                    hardMode = true
                     hard()
                }
                if( toRepeat === 10){
                    return {solved: false, hardMode}
                }
            }
    
            return {solved: true, hardMode}
        }

            const hard = () => {
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
                                
                                if(!containsObject(potentialNumbers[i-1][j-1], a)) continue
                                
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
                                let numbersIsPossibilityInTileWhichIsNotInTheSameSquare = containsObject(potentialNumbers[whatX[0]][d], a)
                                && ! containsObject(whatY,d)
                                if(numbersIsPossibilityInTileWhichIsNotInTheSameSquare){
                                    potentialNumbers[whatX[0]][d] = removeValueFromArray(potentialNumbers[whatX[0]][d], a)
                                }
                            }
                        }
                        
                        let doesNumberHavePossibleTilesOnlyWithSameYInSquare = blockadeY === true && howManyNumbers > 0
                        if(doesNumberHavePossibleTilesOnlyWithSameYInSquare){  
                            for (let d = 0; d < 9; d++){
                                
                                let numbersIsPossibilityInTileWhichIsNotInTheSameSquare = containsObject(potentialNumbers[d][whatY[0]], a)
                                    && !containsObject(whatX,d)
                                if(numbersIsPossibilityInTileWhichIsNotInTheSameSquare){ 
                                    potentialNumbers[d][whatY[0]] = removeValueFromArray(potentialNumbers[d][whatY[0]], a)                
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
                        
                        if(!containsObject(potentialNumbers[x][y], a)) continue
                        
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
                                if(containsObject(potentialNumbers[c][d], a) && !containsObject(whatY, d)){                          
                                    potentialNumbers[c][d] = removeValueFromArray(potentialNumbers[c][d], a)
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
                        if(!containsObject(potentialNumbers[x][y], a)) continue
                        
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
                                
                                if(containsObject(potentialNumbers[c][d], a) && !containsObject(whatX, d)){
                                                                    
                                    potentialNumbers[c][d] = removeValueFromArray(potentialNumbers[c][d], a)
                                    return
                                }
                            }
                        }
                    }
                }
            }
            return
        }
        
        createSudoku()
    }
}
  