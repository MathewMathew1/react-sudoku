//fibo.worker.js
// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = function(message){
        let numberListArranged = []
    
        const isSafe = (sudoku, row, col, num) =>{
            for(let x=0; x < 9; x++){
                if( sudoku[row][x] === num){
                    return false
                }
                if( sudoku[x][col] === num){
                    return false
                }
            }      
            let startRow = row - row % 3
            let startCol = col - col % 3
            for(let i=0; i < 3; i++){
                for(let j=0; j < 3; j++){
                    if(sudoku[i + startRow][j + startCol] === num){
                        return false
                    }
                }
            }
            return true
        }


       const findEmptyLocation = (arr, tile) =>{
            for(let x=0; x < 9; x++){
                for(let y=0; y < 9; y++){
                    if( arr[x][y] === 0){
                        tile[0] = x
                        tile[1] = y
                        return true
                    }    
                }
            }
            return false
        }

        const removeValueFromArray = (arraY, value)=> {
            for( let a = 0; a < arraY.length; a++){
                if ( arraY[a] === value) { 
                    arraY.splice(a, 1); 
                }
            }
            return arraY
        }

        const getRandomNumber = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }
         

        const bruteForceSudoku = (sudoku) =>{
            
            let tile = [0, 0]
            if(!findEmptyLocation(sudoku, tile)){
                return true
            }    
        
            let row = tile[0]
            let col = tile[1]
            let l = numberListArranged.length
            
            for (let i = 0;  i < l; i++) {
                if(isSafe(sudoku, row, col, numberListArranged[i])){
                    sudoku[row][col] = numberListArranged[i]
                    if(bruteForceSudoku(sudoku)!==false){
                        return true
                    }
                    sudoku[row][col] = 0
                }
            }     
            return false
        }
   
        const arrangeNumber = () => {
            
            let numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9]
            let numberListArrangedCopy = []
            for (let i = 0; i < 9; i++){
                let a = getRandomNumber(0,9-i)
                numberListArrangedCopy.push(numberList[a])
                numberList = removeValueFromArray(numberList, numberList[a])
            }
            
            numberListArranged = numberListArrangedCopy
        }
        
        const createNewSudoku = () =>{           
            arrangeNumber()    
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
            
            bruteForceSudoku(newCreatedSudoku)

            return newCreatedSudoku
        
        };

        const newSudoku = createNewSudoku()
        
        postMessage(newSudoku)
    }
}
  