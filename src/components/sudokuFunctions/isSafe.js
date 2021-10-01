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

export default isSafe