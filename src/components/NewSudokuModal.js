import ReactModal from 'react-modal';
import React from 'react';
import { containsObject} from './helpers/helpers';
import isSafe from './sudokuFunctions/isSafe';

export default class NewSudokuModal extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {

            newSudoku: [["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""],
            ["","", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""]],
            errorsNewSudoku: [],
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

    async convertSudokuAndCheckIfSolvable(){
        this.setState({beingSolved:true})
        

        let copySudoku = []
        for (let i = 0; i < this.state.newSudoku.length; i++){
            copySudoku[i] = this.state.newSudoku[i].slice();
        }
        for(let i=0; i< copySudoku.length; i++){
            for(let j=0; j< copySudoku[i].length; j++){
                if(copySudoku[i][j]===""){
                    copySudoku[i][j] = 0
                    continue
                }
                copySudoku[i][j] = parseInt(copySudoku[i][j])
            }
        }
        
        let numberOfSolutions = await this.props.checkIfSolvable(copySudoku)
       
        this.setState({beingSolved: false})
        if(numberOfSolutions>1){
            this.setState({errorsNewSudoku: ["Sudoku not solvable(more than one possibility)"]})
            return
        }        
        
        if(numberOfSolutions===0){
            
            this.setState({errorsNewSudoku: ["Sudoku not solvable(zero ways of solving)"]})
            return
        }
        
        this.props.changeSudoku(copySudoku)
        this.props.closeModal()
        this.setState({newSudoku: [["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""],
        ["","", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", ""]]})


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
        return (
            <div>
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
                            padding: '20px',
                            overflow: "none"
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
            </div>
        )
    }
}
 
