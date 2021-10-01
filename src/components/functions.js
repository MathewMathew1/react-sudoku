    
export function getPartOfString(str, char, part) {
    return str.split(char)[part]
}

export function containsObject(list, obj) {
    var i
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true
        }
    }
    return false;
}
 
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}   