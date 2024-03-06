import { removeValueFromArray, containsObject, getRandomNumber} from "../helpers/helpers"
import findEmptyLocation from "../sudokuFunctions/findEmptyLocation"
import isSafe from "../sudokuFunctions/isSafe"

export default class SudokuA {
    constructor(numbers, updateCaptions, updateNumber, changeColor, prepareSleep, updatePotentials, changeNumbers) {
        let newSudoku = [];

        for (let i = 0; i < numbers.length; i++){
            newSudoku[i] = numbers[i].slice();
        }    

        this.numbers = newSudoku
        this.known = 0
        this.showChanges = true
        this.potentialNumbers = []
        this.updateCaptions = updateCaptions
        this.updateNumber = updateNumber
        this.updateColor = changeColor
        this.creationMode = false
        this.prepareSleep = prepareSleep
        this.updatePotentials = updatePotentials
        this.numberListArranged = [1,2,3,4,5,6,7,8,9]
        this.changeNumbers = changeNumbers
        this.uniqueSolutions = 0
        this.sudokuNumbers = [[]]
        
        for(let i=0; i<9; i++){
            this.potentialNumbers.push([])
            for(let j=0; j<9; j++){
                this.potentialNumbers[i].push([])
            }
        }
    }

    async setNewNumbers(newNumbers){
        let newSudoku = []

        for (let i = 0; i < newNumbers.length; i++){
            newSudoku[i] = newNumbers[i].slice();
        }  
        this.numbers = newSudoku
    }

    async cleanPossibilities(){
        for(let i=0; i<9; i++){
            for(let j=0; j<9; j++){
                this.potentialNumbers[i][j] = []
            }
        }
    }

    async checkIfSolvable(sudoku){
        this.uniqueSolutions = 0
        await this.checkNumberOfSolutions(sudoku)
        return {uniqueSolutions: this.uniqueSolutions, sudoku: this.sudokuNumbers}
    }

    async checkNumberOfSolutions(sudoku){
        if(this.uniqueSolutions>1){
            return
        }
        let tile = [0, 0]

        if(!findEmptyLocation(sudoku, tile)){
            this.sudokuNumbers = []

            for (let i = 0; i < sudoku.length; i++){
                this.sudokuNumbers[i] = sudoku[i].slice();
            }  

            this.uniqueSolutions += 1
            return
        } 
   
        let row = tile[0]
        let col = tile[1]
        for (let i = 1;  i < 10; i++) {
            
            if(isSafe(sudoku, row, col, i)){
                sudoku[row][col] = i
                await this.checkNumberOfSolutions(sudoku)
                sudoku[row][col] = 0
            }
        }       

    }

    async updates(x, y, number){
        this.potentialNumbers[x][y] = []
        this.known += 1
        for (let i = 0; i < 9; i++) {
            this.potentialNumbers[x][i] = removeValueFromArray(this.potentialNumbers[x][i], number)
            this.potentialNumbers[i][y] = removeValueFromArray(this.potentialNumbers[i][y], number)
            this.updatePotentials(x, i, this.potentialNumbers[x][i])
            this.updatePotentials(i, y, this.potentialNumbers[i][y])
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
                this.updatePotentials(x, y, this.potentialNumbers[i-1][j-1])
            }
        }
        return
    }

    async solveSudoku(method){
        console.log({method})
        this.baseInfo()
        if(method===0){
            await this.cleanPossibilities()
            await this.getPossibilities()
        }
        else{
         
           await this.bruteForceSudoku([...this.numbers])
           console.log(this.numbers)
           return this.numbers
        }
    }
    
    
    baseInfo() {
        this.known = 0;
        for (let i = 0; i < 9; i++) {
            for (let a = 0; a < 9; a++) {
                if (this.numbers[i][a] !== 0) {
                    this.known += 1 // needed for later to check if there is any progress
                }
            }
        }
    }

    async getPossibilities() {
        let canNumberBeThere;
        if(!this.creationMode){
            this.updateCaptions("Assigning possible numbers", "red")
            await this.prepareSleep(25)
        }
        
        let squareEdges = [0, 0, 0, 0]
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (this.numbers[x][y] !== 0) continue
                for (let a = 1; a < 10; a++) {
                    canNumberBeThere = false
                    for (let b = 0; b < 9; b++) {
                        if (this.numbers[x][b] === a || this.numbers[b][y] === a) {
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
                                if (this.numbers[i][j] === a) {
                                    canNumberBeThere = true
                                    break
                                }
                            }
                        }
                    }
                    if(canNumberBeThere === true) continue
                    this.potentialNumbers[x][y].push(a)
                    this.updatePotentials(x, y, this.potentialNumbers[x][y])
                    
                    await this.prepareSleep(50)
                } 
            }
        }
        await this.solo()
        await this.solving()
        return
    }

    async solo(){
        if(!this.creationMode){
            this.updateCaptions("Looking for single possibility in tile", "green")
            await this.prepareSleep(125)
        }
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (this.potentialNumbers[x][y].length === 1){
                    this.numbers[x][y] = this.potentialNumbers[x][y][0]
                    
                    if(this.creationMode === false){
                        this.updateNumber(x, y, this.potentialNumbers[x][y][0])
                        this.updateColor(x ,y, "green")
                    }
                    this.updates(x, y, this.potentialNumbers[x][y][0])
                    await this.prepareSleep(75)
                }     
            }
        }     

    }

    async solving() {
        let toRepeat = 0
        while (this.known < 81){
            let baseKnown = this.known
            if(!this.creationMode){
                this.updateCaptions("Checking for single possibility in row/col/square", "green")
            }
            
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
                        this.numbers[temp_c[1]][temp_c[2]] = a
                        if(this.creationMode === false){
                            this.updateNumber(temp_c[1], temp_c[2], a)
                            this.updateColor(temp_c[1], temp_c[2], "blue")
                        }
                        this.updates(temp_c[1], temp_c[2], a)
                        await this.prepareSleep(75)
                    }
                    
                    if(temp_d[0] === 1){
                        if(temp_d[1]!==temp_d[2]){   //Since We are checking both rows and columns, in situation when x and y are the same we set number two times
                            this.numbers[temp_d[1]][temp_d[2]] = a
                            if(this.creationMode === false){
                                this.updateNumber(temp_d[1], temp_d[2], a)
                                this.updateColor(temp_d[1], temp_d[2], "blue")
                            }
                            this.updates(temp_d[1], temp_d[2], a)
                            await this.prepareSleep(75)
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
                            this.numbers[temp_c[1]][temp_c[2]] = a
                            if(this.creationMode === false){
                                this.updateNumber(temp_c[1], temp_c[2], a)
                                this.updateColor(temp_c[1], temp_c[2], "blue")
                            }
                            this.updates(temp_c[1], temp_c[2], a)
                            await this.prepareSleep(75)
                        }
                    }
                }
            }

            await this.solo()            
            if (baseKnown === this.known){
                toRepeat = toRepeat + 1
                await this.hard()
                await this.prepareSleep(75)
            }
            if( toRepeat === 10){
                this.updateCaptions("Unable to solve Sudoku", "purple")
                return
            }
        }
        
        this.updateCaptions("Finished", "pink")
    }

    async bruteForceSudoku(sudoku){
        let tile = [0, 0]
        if(!findEmptyLocation(sudoku, tile)){
            return true
        }    

        let row = tile[0]
        let col = tile[1]
        let l = this.numberListArranged.length
        for (let i = 0;  i < l; i++) {
            if(isSafe(sudoku, row, col, this.numberListArranged[i])){
                sudoku[row][col] = this.numberListArranged[i]
                if(! this.creationMode){
                    await this.prepareSleep(5, true)
                    this.updateNumber(row, col, this.numberListArranged[i], true)
                }
                if(await this.bruteForceSudoku(sudoku)!==false){
                    if(this.creationMode){
                        return sudoku
                    }

                    return true
                }
                this.updateNumber(row, col, 0, true)   
                sudoku[row][col] = 0
            }
        }       
        return false
    }

    async arrangeNumber(){
        
        let numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        let numberListArrangedCopy = []
        for (let i = 0; i < 9; i++){
            let a = getRandomNumber(0,9-i)
            numberListArrangedCopy.push(numberList[a])
            numberList = removeValueFromArray(numberList, numberList[a])
        }
        
        this.numberListArranged = numberListArrangedCopy
    }

    async createNewSudoku(){    
        await this.arrangeNumber()    
        let newCreatedSudoku = [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]]
        
        for (let i = 1; i < 10; i++){
            while(true){
                let X_Place=getRandomNumber(0,9)
                let Y_Place=getRandomNumber(0,9)
                if(newCreatedSudoku[X_Place][Y_Place]===0){
                    newCreatedSudoku[X_Place][Y_Place] = i
                    break
                }    
            }
        }
        this.creationMode = true
        
        newCreatedSudoku = await this.bruteForceSudoku(newCreatedSudoku)
        let removeValueFromArrayNumbers = []
        let X_to_removeValueFromArray = 0
        let Y_to_removeValueFromArray = 0
        let known = 81
        let a= 0
        
        while(a<100){

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

            if(await this.bruteForceSudoku(copyArray)!==false) continue

            if(known<30){ 
                newCreatedSudoku[X_to_removeValueFromArray][Y_to_removeValueFromArray] = removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].number
                
                break
            }

            for(let j=0; j<3; j++){
                known += 1
                newCreatedSudoku[removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].x][removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].y] = removeValueFromArrayNumbers[removeValueFromArrayNumbers.length-1].number
            }

        }
        let newSudoku = [];

        for (let i = 0; i < newCreatedSudoku.length; i++){
            newSudoku[i] = newCreatedSudoku[i].slice();
        }
        this.changeNumbers(newSudoku)
        this.creationMode = false
        this.updateCaptions("Sudoku Created", "pink")


        return
    }


    async hard(){
        await this.prepareSleep(75)
        if(!this.creationMode){
            this.updateCaptions("Removing blocked numbers", "purple")
        }
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
                                this.updatePotentials(whatX[0], d, this.potentialNumbers[whatX[0]][d])
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
                                this.updatePotentials(d, whatY[0], this.potentialNumbers[d][whatY[0]])                  
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

                                this.updatePotentials(c, d, this.potentialNumbers[c][d]) 
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
                                this.updatePotentials(c, d, this.potentialNumbers[c][d]) 
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