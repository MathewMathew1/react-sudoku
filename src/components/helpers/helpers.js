const removeValueFromArray = (arraY, value)=> {
    for( let a = 0; a < arraY.length; a++){
        if ( arraY[a] === value) { 
            arraY.splice(a, 1); 
        }
    }
    return arraY
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getPartOfString = (str, char, part) => {
    return str.split(char)[part]
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
 
export {removeValueFromArray, sleep, containsObject, getPartOfString, getRandomNumber}
