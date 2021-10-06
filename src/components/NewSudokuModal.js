import ReactModal from 'react-modal';
import React from 'react';
import { containsObject} from './functions';
import isSafe from './sudokuFunctions/isSafe';
import findEmptyLocation from './sudokuFunctions/findEmptyLocation';

export default class NewSudokuModal extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {

            newSudoku: [[0, 0, 0, 0, 9, 0, 0, 0, 0], [0, 1, 8, 7, 0, 0, 0, 0, 0], [4, 0, 0, 8, 0, 0, 0, 0, 1],
            [0, 6, 0, 0, 0, 8, 0, 0, 0], [1, 0, 0, 4, 0, 0, 3, 0, 0], [0, 7, 0, 0, 0, 0, 8, 2, 9],
            [0, 2, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 9, 0, 4, 2, 7, 0], [6, 0, 0, 0, 5, 0, 1, 0, 0]],
            errorsNewSudoku: [],
            uniqueSolution: 0,
            beingSolved: false
        };
    }
    
    changeNumberInNewSudoku = (e, index, index2) => {
        let possibleInputs = [1,2,3,4,5,6,7,8,9]
        if(containsObject(possibleInputs, parseInt(e.target.value))){
            if(!isSafe(this.state.newSudoku, index, index2, parseInt(e.target.value))){
                return
            }
            let copyArray = [...this.state.newSudoku]
            copyArray[index][index2] = parseInt(e.target.value)
            this.setState({newSudoku: copyArray})
        }
        
        if(e.target.value ===""){
            let copyArray = this.state.newSudoku
            copyArray[index][index2] = e.target.value
            this.setState({newSudoku: copyArray})
        } 

    }

    async convertSudokuAndCheckIfSolvable(newSudoku=[...this.state.newSudoku]){
        this.setState({beingSolved:true})
        let copySudoku = []
        for (let i = 0; i < newSudoku.length; i++){
            copySudoku[i] = newSudoku[i].slice();
        }
        for(let i=0; i< copySudoku.length; i++){
            for(let j=0; j< copySudoku[i].length; j++){
                if(copySudoku[i][j]===""){
                    copySudoku[i][j] = 0
                }
            }
        }
        await this.setState({uniqueSolution: 0})
        this.setState({errorsNewSudoku: []})
  
        await this.checkIfOnlyOneSolution(copySudoku)
            this.props.changeSudoku(this.state.newSudoku)
        if(this.state.uniqueSolution>1){
            this.setState({errorsNewSudoku: ["Sudoku not solvable(more than possibility)"]})
        }
        else if(this.state.uniqueSolution===0){
            this.setState({errorsNewSudoku: ["Sudoku not solvable(zero ways of solving)"]})
        }
        else{
            this.setState({numbersSudoku: copySudoku})
            this.props.closeModal()
            this.setState({newSudoku: [["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""],
            ["","", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""]]})
        }

    }

    async checkIfOnlyOneSolution(sudoku){
        if(this.state.uniqueSolution>1 || this.props.modalIsOpen === false){
            return
        }
        let tile = [0, 0]
        
        if(!findEmptyLocation(sudoku, tile)){
           
            this.setState({uniqueSolution: this.state.uniqueSolution + 1})
            return true
        } 
   
        let row = tile[0]
        let col = tile[1]
        for (let i = 1;  i < 10; i++) {
            
            if(isSafe(sudoku, row, col, i)){
                sudoku[row][col] = i
                await this.checkIfOnlyOneSolution(sudoku)
                sudoku[row][col] = 0
            }
        }       
    return false
    }

    sleep = (ms) => {
        
        return new Promise(resolve => setTimeout(resolve, ms));
        
    }

    focus = () => {
        let element = document.getElementById("Nsd00")
        element.focus()
    }

    setCharAt = (str,index,chr) => {
        if(index > str.length-1) return str;
        return str.substring(0,index) + chr + str.substring(index+1);
    }

    moveFocus=(event)=>{
        let element = document.activeElement

        if(event.keyCode === 40){
            
            if(parseInt(element.id[3])+1<9){
                let newId = this.setCharAt(element.id,3,parseInt(element.id[3])+1)
                let newElement = document.getElementById(newId)
                console.log(newElement)
                newElement.focus()
            }
        }
        if(event.keyCode ===38){
            if(parseInt(element.id[3])-1>=0){
                let newId = this.setCharAt(element.id,3,parseInt(element.id[3])-1)
                let newElement = document.getElementById(newId)
                newElement.focus()
            }
        }
        if(event.keyCode ===39){
            if(parseInt(element.id[4])+1<9){
                let newId = this.setCharAt(element.id,4,parseInt(element.id[4])+1)
                let newElement = document.getElementById(newId)
                newElement.focus()
            }
        }
        if(event.keyCode ===37){
            if(parseInt(element.id[4])-1>=0){
                let newId = this.setCharAt(element.id,4,parseInt(element.id[4])-1)
                let newElement = document.getElementById(newId)
                newElement.focus()
            }
        }
    //38 up 40 down 39 right 37 left
    }

    render() { 
        return <div>
            <ReactModal
                isOpen={this.props.modalIsOpen}
                contentLabel={"Create Sudoku"}
                onRequestClose={this.props.closeModal}
                id={"some-id"}
                onAfterOpen={this.focus}
                ariaHideApp={false}

                shouldFocusAfterRender={true}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                shouldReturnFocusAfterClose={true}
                style={{
                    overlay: {
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    textAlign: "center", 
                    },
                    content: {
                        position: 'relative',
                        display: "inline-block",
                        border: '1px solid #ccc',
                        background: '#fff',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '4px',
                        inset: '0',
                        outline: 'none',
                        padding: '20px'
                    }
                }}>
                <table  className="sudokuTable">
                    <caption>Create your own Sudoku</caption>
                    <colgroup><col/><col/><col/></colgroup>
                    <colgroup><col/><col/><col/></colgroup>
                    <colgroup><col/><col/><col/></colgroup>
                    <tbody>
                    {this.state.newSudoku.map((value, index) => {
                            return( 
                                <tr key={index}>
                                    {this.state.newSudoku[index].map((value, index2) => {
                                        return(
                                            <td key={index2} >
                                                <input onKeyDown={(event)=> this.moveFocus(event)} 
                                                    id={"Nsd"+index.toString()+index2.toString()} className="sudoku-td-input" value={value} 
                                                    onChange={(e) => this.changeNumberInNewSudoku(e, index, index2)}  >
                                                </input>
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                    <div className="right">
                        <button className="button close" onClick={()=> this.props.closeModal()} >
                            Close
                        </button>
                        <button disabled={this.state.beingSolved} className="button solve" 
                            onClick={()=> this.convertSudokuAndCheckIfSolvable(this.state.newSudoku)} >
                                Save
                        </button>
                    </div>
                        {this.state.errorsNewSudoku.map((value3, index3) => {
                            return(
                                <div key={index3} className="error">{value3}</div>
                            )
                        })}
            </ReactModal>

        </div>;
    }
}
 
