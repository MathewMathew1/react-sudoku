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

export default findEmptyLocation