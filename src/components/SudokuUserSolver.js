import { useEffect, useState } from "react";


const SudokuUserSolver = ({sudoku, completedSudoku, cancelFunction}) => {
    const [sudokuSolved, setSudokuSolved] = useState([[1],[2]])
    const [focusedElement, setFocusedElement] = useState(null);
    
    useEffect(() => {
        let newCreatedSudoku = [];
        for (let i = 0; i < sudoku.length; i++){
            newCreatedSudoku[i] = sudoku[i].slice();
        }
        
        setSudokuSolved(newCreatedSudoku)
    }, [sudoku]);

    const handleInputChange = (rowIndex, colIndex, e) => {
        if(sudoku[rowIndex][colIndex]!==0){
            return
        }

        let value = parseInt(e.target.value) || "";
        if(value === ""){
            return
        } // Parse the input value to an integer
        if (value > 9) {
            value = value % 10; // Get the last digit
        }

        const newSudoku = [...sudokuSolved];
        newSudoku[rowIndex][colIndex] = value;
        setSudokuSolved(newSudoku);
    };

    const shouldHighlight = (rowIndex, colIndex, focusedElement) => {
        if (!focusedElement) return false;
    
        const { row: focusedRow, col: focusedCol } = focusedElement;
    
        // Check if it's in the same row, column, or block as the focused element
        return (
            rowIndex === focusedRow || colIndex === focusedCol || (
            Math.floor(rowIndex / 3) === Math.floor(focusedRow / 3) &&
            Math.floor(colIndex / 3) === Math.floor(focusedCol / 3))
        );
    };

    

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!focusedElement) return;
        
            const { row, col } = focusedElement;
            let newRow = row;
            let newCol = col;
        
            switch (e.key) {
              case "ArrowUp":
                newRow = Math.max(row - 1, 0);
                break;
              case "ArrowDown":
                newRow = Math.min(row + 1, 8);
                break;
              case "ArrowLeft":
                newCol = Math.max(col - 1, 0);
                break;
              case "ArrowRight":
                newCol = Math.min(col + 1, 8);
                break;
              default:
                return;
            }
        
            setFocusedElement({ row: newRow, col: newCol });
            const inputToFocus = document.getElementById(`input ${newRow}/${newCol}`);
            inputToFocus.focus();
          };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
    }, [focusedElement]);

    return <div className="box flex">
        <table className="sudokuTable">
            <caption style={{color: "white", backgroundColor: "green"}} >Solve Sudoku</caption>
            <colgroup><col/><col/><col/></colgroup>
            <colgroup><col/><col/><col/></colgroup>
            <colgroup><col/><col/><col/></colgroup>
            <tbody>
                {sudokuSolved.map((col, index) => {
                return (
                    <tr key={`${index} column`}>
                    {col.map((row, indexOfRow) => {
                        return (
                        <td key={`${indexOfRow} row`}>
                           <input 
                                id={`input ${index}/${indexOfRow}`}
                                onFocus={() => setFocusedElement({ row: index, col: indexOfRow })}
                                onBlur={() => setFocusedElement(null)}
                                className={`
                                    ${shouldHighlight(index, indexOfRow, focusedElement) ? "highlighted" : ""} 
                                    ${sudokuSolved[index][indexOfRow] !== 0 && sudokuSolved[index][indexOfRow] !== completedSudoku[index][indexOfRow]  ? "wrong-number" : ""} 
                                    input-sudoku-solver`}
                                type="text" 
                                value={row!==0? row: ""} 
                                onChange={(e) => handleInputChange(index, indexOfRow, e)} 
                            />
                        </td>
                        );
                    })}
                    </tr>
                );
                })}
            </tbody>
        </table>
        <div>
            <button className="button create" onClick={()=>cancelFunction()}>Cancel</button>
        </div>
    </div>
}
 
export default SudokuUserSolver;