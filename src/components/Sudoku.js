 // a in loops correspond to number x to rows y to columns



import NewSudokuModal from './NewSudokuModal';
import isSafe from './sudokuFunctions/isSafe';
import React from "react";
import { containsObject } from './functions';
import findEmptyLocation from './sudokuFunctions/findEmptyLocation';




const getRandomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

const remove = (arraY, value)=> {
    for( let a = 0; a < arraY.length; a++){
        if ( arraY[a] === value) { 
            arraY.splice(a, 1); 
        }
    }
    return arraY
}



export default class Sudoku extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            aiMode: true,
            numbersSudoku: [], 
            potentialNumbers: new Array(9),
            buttonDisable: false,
            speed: 1,
            caption: "Sudoku not started yet",
            known: 0,
            captionColor: "blue",
            numberListArranged: [],
            sleepTime: 0,
            creationMode: false,
            totalTime: 0,
            wayOfSolving: "Backtracking",
            startTime: Date(),
            finishTime: Date(),
            colors: [],
            modalIsOpen: false,
            solutionToSudoku: []
        };
   
        for (let i = 0; i < this.state.potentialNumbers.length; i++) {
            this.state.potentialNumbers[i] = [];
            for (let a = 0; a < this.state.potentialNumbers.length; a++)
            this.state.potentialNumbers[i][a]=[];
        }
        for (let i = 0; i < 9; i++) {
            this.state.colors.push([]);
            for (let a = 0; a < 9; a++) {
                this.state.colors[i].push("black")
            }
        }
    }
    
    sleep = (ms) => {
        if(this.state.creationMode===false){
            let timeSleep = this.state.speed*ms
            this.setState({sleepTime: this.state.sleepTime + timeSleep})
            return new Promise(resolve => setTimeout(resolve, timeSleep));
        }
        return
    }

    

    handleChange = (e) => {
        this.setState({ speed: e.target.value });
      };
    
      

    componentDidMount(){
        let numbers = [[0, 0, 0, 0, 9, 0, 0, 0, 0], [0, 1, 8, 7, 0, 0, 0, 0, 0], [4, 0, 0, 8, 0, 0, 0, 0, 1],
        [0, 6, 0, 0, 0, 8, 0, 0, 0], [1, 0, 0, 4, 0, 0, 3, 0, 0], [0, 7, 0, 0, 0, 0, 8, 2, 9],
        [0, 2, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 9, 0, 4, 2, 7, 0], [6, 0, 0, 0, 5, 0, 1, 0, 0]]
        this.setState({numbersSudoku: numbers})  
        this.baseInfo(numbers)     
        this.arrangeNumber() 
    }

    openModal=()=>{
        this.setState({errorsNewSudoku: []})
        this.setState({modalIsOpen: true})
    }

    closeModal=()=>{
        this.setState({modalIsOpen: false})
    }

    changeSudoku = (newSudoku) => {
        this.setState({numbersSudoku: newSudoku})
    }

    changeMethodOfSolving = () => {
        if(this.state.wayOfSolving === "Backtracking"){
            this.setState({wayOfSolving: "Human approach"})
        }
        else this.setState({wayOfSolving: "Backtracking"})
    }

    async updates(x, y, number){
        var copyArray = this.state.potentialNumbers
        copyArray[x][y] = []
        await this.setState({known: this.state.known+1})
        for (let i = 0; i < 9; i++) {
            copyArray[x][i] = remove(copyArray[x][i], number)
            copyArray[i][y] = remove(copyArray[i][y], number)
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
                for( let a = 0; a < copyArray[i-1][j-1].length; a++){ 
                    if ( copyArray[i-1][j-1][a] === number) { 
                        copyArray[i-1][j-1].splice(a, 1); 
                    }
                }
            }
        }
        await this.setState({potentialNumbers: copyArray})
        return
    }    
    
    async cleanSudoku(){
        let copyArray = this.state.potentialNumbers 
        for (let i = 0; i < copyArray.length; i++) {
            for (let j = 0; j < copyArray[i].length; j++) {
            copyArray[i][j] = [] 
            }
        }
        let colorsCopy = this.state.colors
        for(let i=0; i < this.state.numbersSudoku.length; i++){
            for(let a=0; a < this.state.numbersSudoku[i].length; a++){
                    colorsCopy[i][a] = "black"
            }
        }
        this.setState({colors: colorsCopy})
        this.setState({potentialNumbers: copyArray})
    }
    

    async changeNumber(x, y, number){
        let numbersSudokuCopy = this.state.numbersSudoku
        numbersSudokuCopy[x][y] = number
        await this.setState({numbersSudoku: numbersSudokuCopy})
        return
    }
    
    async changeColor(x, y, color){
        let colorsCopy = this.state.colors
        colorsCopy[x][y] = color
        await this.setState({colors: colorsCopy})
        return
    }

    async calculateTotalTime(){
        const diffTime = Math.abs(this.state.startTime - this.state.finishTime);
        const diffSeconds = Math.floor(diffTime / (1000));
        this.setState({totalTime: diffSeconds})
    }


    async changeColorsOfAll(){
        let colorsCopy = this.state.colors
        for(let i=0; i < this.state.numbersSudoku.length; i++){
            for(let a=0; a < this.state.numbersSudoku[i].length; a++){
                if(this.state.numbersSudoku[i][a]===0){
                    colorsCopy[i][a] = "red"
                }
            }
        }
        this.setState({colors: colorsCopy})
    }

    async baseInfo(numbers) {
        var known = 0;
        for (let i = 0; i < 9; i++) {
            for (let a = 0; a < 9; a++) {
                if (numbers[i][a] !== 0) {
                    known += 1 // needed for later to check if there is any progress
                }
            }
        }
        await this.setState({known: known})
    }
    
    

    async beginSolving(){
        await this.cleanSudoku()
        await this.setState({buttonDisable: true})
        if(this.state.creationMode){
            await this.setState({caption: "Checking possible numbers in tiles"})
            await this.setState({captionColor: "red"})
        }
        await this.setState({sleepTime: 0})
        this.startTime = Date.now()
        await this.setState({creationMode: false})
        if(this.state.wayOfSolving==="Backtracking"){
            this.setState({caption: "Brute force"})
            await this.changeColorsOfAll()
            await this.solveSudoku(this.state.numbersSudoku)
        }
        else{
            await this.getPossibilities(this.state.numbersSudoku)
        }
        this.calculateTotalTime()
        
        await this.setState({buttonDisable: false})
        // this.getPossibilities(this.state.numberSudoku)
    }


    async checkIfSolvable(sudoku){
        await this.baseInfo(sudoku)
        await this.getPossibilities(sudoku)
        if(this.state.known>=81){
            return true
        }
        return false
    }


    async getPossibilities(sudoku) {
        let toBreak;
        if(!this.state.creationMode){
            await this.setState({caption: "Assigning possible numbers"})
            await this.setState({captionColor: "red"})
        }
        var squareEdges = [0, 0, 0, 0]
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (sudoku[x][y] !== 0) continue
                for (var a = 1; a < 10; a++) {
                    toBreak = false
                    for (let b = 0; b < 9; b++) {
                        if (sudoku[x][b] === a || sudoku[b][y] === a) {
                            toBreak = true
                            break
                        }
                        squareEdges[0] = (x + 3) % 3
                        squareEdges[1] = (y + 3) % 3
                        squareEdges[0] = x - squareEdges[0]
                        squareEdges[1] = y - squareEdges[1]
                        squareEdges[2] = squareEdges[1] + 3
                        squareEdges[3] = squareEdges[0] + 3
                        for (var i = squareEdges[0]; i < squareEdges[3]; i++) {
                            for (var j = squareEdges[1]; j < squareEdges[2]; j++) {
                                if (sudoku[i][j] === a) {
                                    toBreak = true
                                    break
                                }
                            }
                        }
                    }
                    if(toBreak === true) continue
                    let copy_array = this.state.potentialNumbers
                    copy_array[x][y].push(a)
                    await this.setState({potentialNumbers: copy_array})
                    await this.sleep(50)
                } 
            }
        }
        sudoku = await this.solo(sudoku)
        await this.solving(sudoku)
        return
    }

    async solo(sudoku){
        if(!this.state.creationMode){
            await this.sleep(125)
            await this.setState({captionColor: "green"})
            await this.setState({caption: "Looking for single possibility in tile"})
        }
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (this.state.potentialNumbers[x][y].length === 1){
                    sudoku[x][y] = this.state.potentialNumbers[x][y][0]
                    if(this.state.creationMode === false){
                        this.setState({numbersSudoku: sudoku})
                        this.changeColor(x ,y, "green")
                    }
                    this.updates(x, y, this.state.potentialNumbers[x][y][0])
                    await this.sleep(75)
                }     
            }
        }     
        return sudoku
    }
    
    async solving(sudoku) {
        var toRepeat = 0
        while (this.state.known < 81){
            let baseKnown = this.state.known
            if(!this.state.creationMode){
                await this.setState({captionColor: "green"})
                await this.setState({caption: "Checking for single possibility in row/col/square"})
            }
            for (let a = 1; a < 10; a++) {
                for (let x = 0; x < 9; x++) {
                    var temp_c = [0, 0, 0]
                    var temp_d = [0, 0, 0]
                    for (let y = 0; y < 9; y++) {
                        if(containsObject(this.state.potentialNumbers[x][y], a)){
                            temp_c[0] = temp_c[0] + 1
                            temp_c[1] = x
                            temp_c[2] = y
                        }  
                        if(containsObject(this.state.potentialNumbers[y][x], a)){
                                temp_d[0] = temp_d[0] + 1
                                temp_d[1] = y
                                temp_d[2] = x
                        }           
                    }
                    if(temp_c[0] === 1){
                        sudoku[temp_c[1]][temp_c[2]] = a
                        if(this.state.creationMode === false){
                            this.setState({numbersSudoku: sudoku})
                            this.changeColor(temp_c[1] ,temp_c[2], "blue")
                        }
                        this.updates(temp_c[1], temp_c[2], a)
                        await this.sleep(75)
                    }
                    if(temp_d[0] === 1){
                        if(sudoku[temp_d[1]][temp_d[2]]===0){   //Since We are checking both rows and columns, in situation when x and y are the same we set number two times
                            sudoku[temp_d[1]][temp_d[2]] = a
                            if(this.state.creationMode === false){
                                this.setState({numbersSudoku: sudoku})
                                this.changeColor(temp_d[1] ,temp_d[2], "blue")
                            }
                            this.updates(temp_d[1], temp_d[2], a)
                            await this.sleep(75)
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
                                if(containsObject(this.state.potentialNumbers[i-1][j-1], a)){
                                    temp_c[0] = temp_c[0] + 1
                                    temp_c[1] = i - 1
                                    temp_c[2] = j - 1
                                }
                            }
                        }    
                        if(temp_c[0] === 1){
                            sudoku[temp_c[1]][temp_c[2]] = a
                            if(this.state.creationMode === false){
                                this.setState({numbersSudoku: sudoku})
                                this.changeColor(temp_c[1] ,temp_c[2], "blue")
                            }
                            this.updates(temp_c[1], temp_c[2], a)
                            await this.sleep(75)
                        }
                    }
                }
            }
            sudoku = await this.solo(sudoku)            
            if (baseKnown === this.state.known){
                toRepeat = toRepeat + 1
                await this.hard()
                await this.sleep(75)
            }
            if( toRepeat === 10){
                await this.setState({caption: "Unable to solve Sudoku"})
                return
            }
        }
        await this.setState({caption: "Finished"})
        await this.setState({captionColor: "pink"})
        return
    }

    async hard(){
        await this.sleep(75)
        if(!this.state.creationMode){
            await this.setState({captionColor: "purple"})
            await this.setState({caption: "Removing blocked numbers"})  
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
                            if(!containsObject(this.state.potentialNumbers[i-1][j-1], a)) continue
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
                    let doesNumberHavePossibleTilesOnlyWithSameXInSqaure = blockadeX === true && howManyNumbers > 0
                    if (doesNumberHavePossibleTilesOnlyWithSameXInSqaure){
                        for (let d = 0; d < 9; d++){
                            let numbersIsPosiblityInTileWhichIsNotInTheSameSquare = containsObject(this.state.potentialNumbers[whatX[0]][d], a)&& ! containsObject(whatY,d)
                            if(numbersIsPosiblityInTileWhichIsNotInTheSameSquare){
                                let copyArray = this.state.potentialNumbers
                                copyArray[whatX[0]][d] = remove(copyArray[whatX[0]][d], a)
                                await this.setState({potentialNumbers: copyArray})
                               
                            }
                        }
                    }
                    let doesNumberHavePossibleTilesOnlyWithSameYInSqaure = blockadeY === true && howManyNumbers > 0
                    if(doesNumberHavePossibleTilesOnlyWithSameYInSqaure){  
                        for (let d = 0; d < 9; d++){
                            let numbersIsPosiblityInTileWhichIsNotInTheSameSquare = containsObject(this.state.potentialNumbers[d][whatY[0]], a)&& !containsObject(whatX,d)
                            if(numbersIsPosiblityInTileWhichIsNotInTheSameSquare){
                                let copyArray = this.state.potentialNumbers
                                copyArray[d][whatY[0]] = remove(copyArray[d][whatY[0]], a)
                                await this.setState({potentialNumbers: copyArray})
                               
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
                    if(!containsObject(this.state.potentialNumbers[x][y], a)) continue
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
                    for (let c = squareEdges[0]; c < squareEdges[3]; c++){ // removes pos from square
                        for (let d = squareEdges[1]; d < squareEdges[2]; d++){  
                            if(containsObject(this.state.potentialNumbers[c][d], a) && !containsObject(whatY, d)){
                                let copyArray = this.state.potentialNumbers
                                copyArray[c][d] = remove(copyArray[c][d], a)
                                await this.setState({potentialNumbers: copyArray})
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
                    if(!containsObject(this.state.potentialNumbers[x][y], a)) continue
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
                    for (let c = squareEdges[0]; c < squareEdges[3]; c++){ // removes pos from square
                        for (let d = squareEdges[1]; d < squareEdges[2]; d++){
                            console.log(c+" "+d)
                            if(containsObject(this.state.potentialNumbers[c][d], a) && !containsObject(whatX, d)){
                                let copyArray = this.state.potentialNumbers
                                copyArray[c][d] = remove(copyArray[c][d], a)
                                await this.setState({potentialNumbers: copyArray})
                                return
                            }
                        }
                    }
                }
            }
        }
        return
    }


    async arrangeNumber(){
        let numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        let numberListArrangedC = []
        for (let i = 0; i < 9; i++){
            let a = getRandomNumber(0,9-i)
            numberListArrangedC.push(numberList[a])
            numberList = remove(numberList, numberList[a])
        }
        await this.setState({numberListArranged: numberListArrangedC})
    }

    async newSudoku(){
        this.setState({caption: "Sudoku Begin creating"})
        this.setState({buttonDisable: true})
        this.setState({creationMode: true})
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
        newCreatedSudoku = await this.solveSudoku(newCreatedSudoku)
        let removedNumbers = []
        var X_to_remove = 0
        var Y_to_remove = 0
        var known = 81
        let a= 0
        while(a<100){
            a += 1
            while(true){
               X_to_remove = getRandomNumber(0,9)
               Y_to_remove = getRandomNumber(0,9)
                if(newCreatedSudoku[X_to_remove][Y_to_remove] !== 0){
                    removedNumbers.push([X_to_remove, Y_to_remove, newCreatedSudoku[X_to_remove][Y_to_remove]])
                    newCreatedSudoku[X_to_remove][Y_to_remove] = 0
                    known -= 1
                    break
                }
            }   
            let copyArray = []
            for (var i = 0; i < newCreatedSudoku.length; i++){
                copyArray[i] = newCreatedSudoku[i].slice();
            }
            if(await this.checkIfSolvable(copyArray)===false){
                if(known<30){   
                    newCreatedSudoku[X_to_remove][Y_to_remove] = removedNumbers[removedNumbers.length-1][2]
                    this.setState({numbersSudoku: newCreatedSudoku})
                    await this.cleanSudoku()
                    break
                }
                else{
                    for(let j=0; j<3; j++){
                        known += 1
                        newCreatedSudoku[removedNumbers[removedNumbers.length-1][0]][removedNumbers[removedNumbers.length-1][1]] = removedNumbers[removedNumbers.length-1][2]
                    }
                }
            }

        }
        await this.cleanSudoku()
        this.setState({creationMode: false})
        this.setState({caption: "Sudoku Created"})
        this.setState({captionColor: "pink"})
        this.setState({buttonDisable: false})
        return
}

   async solveSudoku(sudoku){
        let tile = [0, 0]
        if(!findEmptyLocation(sudoku, tile)){
            return true
        }    
        let row = tile[0]
        let col = tile[1]
        let l = this.state.numberListArranged.length
        for (let i = 0;  i < l; i++) {
            if(isSafe(sudoku, row, col, this.state.numberListArranged[i])){
                sudoku[row][col] = this.state.numberListArranged[i]
                if(! this.state.creationMode){
                    if(this.state.speed !== 0){
                        await this.sleep(25)
                    }
                    await this.setState({numbersSudoku: sudoku})
                }
                if(await this.solveSudoku(sudoku)!==false){
                    if(this.state.creationMode){
                        return sudoku
                    }
                    return true
                }   
                sudoku[row][col] = 0
            }
        }       
    return false
    }
    


render() {
    return (
        <div className="box">
            <div className="grid-container">
                <div className="sudoku-div">
                    <table  className="sudokuTable">
                        <caption style={{background: this.state.captionColor}} >{this.state.caption}</caption>
                        <colgroup><col/><col/><col/></colgroup>
                        <colgroup><col/><col/><col/></colgroup>
                        <colgroup><col/><col/><col/></colgroup>
                        <tbody>
                            {this.state.numbersSudoku.map((_value, index) => {
                                return( 
                                    <tr key={index}>
                                        {this.state.numbersSudoku[index].map((value, index2) => {
                                            if(this.state.numbersSudoku[index][index2]!==0) 
                                                return(
                                                <td key={index2} id={"sd"+index.toString()+index2.toString()} style={{color: this.state.colors[index][index2]}}>{value}</td>
                                                )
                                            else if(this.state.potentialNumbers[index][index2].length===0) {
                                                return (
                                                    <td key={index2}></td>
                                                )
                                            }
                                            else{
                                                return(
                                                <td key={index2}>
                                                    <span className="potential_numbers">
                                                        {this.state.potentialNumbers[index][index2].join(" ")}
                                                    </span>
                                                    
                                                </td>   
                                                )
                                            }  
                                        })}
                                </tr>)
                            })}
                        </tbody>
                    </table>
                </div>    
                <div className="right buttons-div">
                    <button disabled={this.state.buttonDisable} onClick={()=> this.openModal()} className="button add">Create</button>
                    <button disabled={this.state.buttonDisable} onClick={()=> this.newSudoku()} className="button create">New</button>
                    <button disabled={this.state.buttonDisable} onClick={()=> this.beginSolving()} className="button solve">Solve</button>
                </div>
                    <div className="label-area">
                        <div >
                            Speed of solving :   {this.state.speed}
                            <input type="range" min="0" max="4" value={this.state.speed} onChange={this.handleChange}  id="myRange"></input>
                        </div>
                        <div >
                            Method of solving :  &nbsp;
                            <label className="switch"  >
                                <input onClick={()=>this.changeMethodOfSolving()} type="checkbox"/>
                                <span className="slider" ><span className="toggle_text">{this.state.wayOfSolving}</span></span>
                            </label>
                        </div>
                    </div>
                    <div className="explaining-labels">
                        <div className="small-box">
                            <div> <div className="rectangle black"></div> - Base numbers</div>
                            <div> <div className="rectangle red"></div> - Potential numbers/Brute force</div>
                            <div> <div className="rectangle blue"></div> - Single possibility in row/col/square</div>
                            <div> <div className="rectangle green"></div> - Single possibility in area</div>
                        </div>   
                    </div>
                </div>
                
                 
            <NewSudokuModal changeSudoku={this.changeSudoku} closeModal={this.closeModal} modalIsOpen={this.state.modalIsOpen} />
        </div>
    
    );
  }
}