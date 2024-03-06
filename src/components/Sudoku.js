 // a in loops correspond to number x to rows y to columns
import NewSudokuModal from './NewSudokuModal';
import React from "react";
import SudokuA from './Sudoku/SudokuA';
import { sleep} from './helpers/helpers';
import WorkerBuilder from "./workerbuilder.js";
import worker from "./worker.js";
import workerHumanSudokuCreator from './workerHumanSudokuCreator';
import workerFullSudoku from './workerFullSudoku';
import SudokuUserSolver from './SudokuUserSolver';

const MAX_SPEED_NUMBER = 4

const SUDOKUS = [
    [[8, 1, 0, 5, 6, 0, 2, 0, 0], [0, 0, 0, 0, 7, 0, 0, 0, 3], [0, 0, 6, 0, 0, 0, 0, 0, 0],
    [9, 6, 0, 0, 5, 0, 0, 7, 0], [0, 0, 4, 0, 0, 0, 9, 0, 0], [0, 0, 2, 6, 0, 0, 0, 0, 0],
    [5, 9, 0, 1, 0, 0, 8, 0, 0], [0, 0, 0, 0, 0, 8, 0, 2, 0], [4, 0, 0, 0, 0, 0, 0, 0, 0]]
]

const COMPLETED_SUDOKU = [
    [8, 1, 9, 5, 6, 3, 2, 4, 7],
    [2, 4, 5, 8, 7, 9, 6, 1, 3],
    [3, 7, 6, 4, 1, 2, 5, 8, 9],
    [9, 6, 3, 2, 5, 1, 4, 7, 8],
    [1, 5, 4, 3, 8, 7, 9, 6, 2],
    [7, 8, 2, 6, 9, 4, 3, 5, 1],
    [5, 9, 7, 1, 2, 6, 8, 3, 4],
    [6, 3, 1, 9, 4, 8, 7, 2, 5],
    [4, 2, 8, 7, 3, 5, 1, 9, 6]
]


const METHODS_OF_SOLVING = [
    {name: "Human approach", methodNumber: 0},
    {name: "Backtracking", methodNumber: 1}
]

const DIFFICULTIES = ["Easy", "Medium", "Hard"]

let sudoku
const bruteForceCreatorInstance = new WorkerBuilder(worker); 
const humanCreatorInstance = new WorkerBuilder(workerHumanSudokuCreator); 
const fullSudokuCreator = new WorkerBuilder(workerFullSudoku); 

export default class Sudoku extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            aiMode: true,
            solveItYourself: false,
            numbersSudoku: SUDOKUS[0], 
            sudokuWithAllNumbers: COMPLETED_SUDOKU,
            potentialNumbers: new Array(9),
            buttonDisable: false,
            speed: 1,
            caption: "Sudoku not started yet",
            captionColor: "blue",
            sleepTime: 0,
            creationMode: false,
            methodNumber: METHODS_OF_SOLVING[0].methodNumber,
            colors: [],
            modalIsOpen: false,
            solutionToSudoku: [],
            difficulty: DIFFICULTIES[0]
        };

        this.updateCaptions = this.updateCaptions.bind(this)
        this.changeColor = this.changeColor.bind(this)
        this.changeNumber = this.changeNumber.bind(this)
        this.cancelSolvingSudokuByUser = this.cancelSolvingSudokuByUser.bind(this)
        this.prepareSleep = this.prepareSleep.bind(this)
        this.changePotentials = this.changePotentials.bind(this)
        this.changeNumbers = this.changeNumbers.bind(this)
        
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
    
    componentDidMount(){
        sudoku = new SudokuA(SUDOKUS[0], this.updateCaptions, this.changeNumber, 
            this.changeColor, this.prepareSleep, this.changePotentials, this.changeNumbers)
        bruteForceCreatorInstance.onmessage = (e) => {

            this.setState({numbersSudoku: e.data})
            this.setState({creationMode: false})
            this.setState({caption: "Sudoku Created"})
            this.setState({captionColor: "pink"})
            this.setState({buttonDisable: false})
            this.cleanColors()
        }    

        fullSudokuCreator.onmessage = (e) => {
            let newCreatedSudoku = [];
            for (let i = 0; i < e.data.length; i++){
                newCreatedSudoku[i] = e.data[i].slice();
            }

            this.setState({fullSudokuCreator: newCreatedSudoku})
            if(this.state.methodNumber === 0){
                humanCreatorInstance.postMessage({sudoku: e.data, difficulty: this.state.difficulty})
            }else{
                bruteForceCreatorInstance.postMessage({sudoku: e.data, difficulty: this.state.difficulty})
            }
            
            //instance.postMessage("create sudoku")
        }

        humanCreatorInstance.onmessage = (e) => {

            this.setState({numbersSudoku: e.data})
            this.setState({creationMode: false})
            this.setState({caption: "Sudoku Created"})
            this.setState({captionColor: "pink"})
            this.setState({buttonDisable: false})
            this.cleanColors()
        }
        
        document.title = "Sudoku"
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
        if(this.state.methodNumber === 1){
            this.setState({methodNumber: METHODS_OF_SOLVING[0].methodNumber})
        }
        else this.setState({methodNumber: METHODS_OF_SOLVING[1].methodNumber})
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
    
    async prepareSleep(ms, skipSleepIfMaximumSpeed = false) {
        if(this.state.creationMode===true || (skipSleepIfMaximumSpeed && this.state.speed === MAX_SPEED_NUMBER)) return
 
        let timeSleep = (MAX_SPEED_NUMBER-this.state.speed)*ms
        await sleep(timeSleep)
    }

    changeNumber(x, y, number, skipSleepIfMaximumSpeed = false){
        if((skipSleepIfMaximumSpeed && this.state.speed === MAX_SPEED_NUMBER)) return
        this.setState((state)=> {
            let {numbersSudoku} = state
            numbersSudoku[x][y] = number
            return {...state, numbersSudoku: numbersSudoku}
        })
    }

    changeNumbers(numbers, skipSleepIfMaximumSpeed = false){
        if((skipSleepIfMaximumSpeed && this.state.speed === MAX_SPEED_NUMBER)) return
        this.setState({numbersSudoku: numbers})
    }
    
    changeColor(x, y, color){
        this.setState((state)=> {
            let {colors} = state
            colors[x][y] = color
            return {...state, colors: colors}
        })
    }

    changePotentials(x, y, numbers){
        this.setState((state)=> {
            let {potentialNumbers} = state
            potentialNumbers[x][y] = numbers
            return {...state, potentialNumbers: potentialNumbers}
        })
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

    async beginSolving(){
        await this.cleanSudoku()
        sudoku.setNewNumbers(this.state.numbersSudoku)

        this.setState({buttonDisable: true})
        if(this.state.creationMode){
            this.setState({caption: "Checking possible numbers in tiles"})
            this.setState({captionColor: "red"})
        }
        this.setState({sleepTime: 0})
        this.setState({creationMode: false})

        if(this.state.methodNumber===1){
            this.setState({captionColor: "red"})
            this.setState({caption: "Backtracking"})
            await this.changeColorsOfAll()
            await sleep(25)
            let resultSudokuNumbers = await sudoku.solveSudoku(this.state.methodNumber)

            this.updateCaptions("Finished", "pink")

            this.setState({numbersSudoku: resultSudokuNumbers})
        }    
        else{
            await sudoku.solveSudoku(this.state.methodNumber)
        }
        
        this.setState({buttonDisable: false})
    }

    async cleanColors(){
        let colors = []
        for (let i = 0; i < 9; i++) {
            colors.push([]);
            for (let a = 0; a < 9; a++) {
                colors[i].push("black")
            }
        }
        this.setState({colors: colors})
    }

    async cancelSolvingSudokuByUser(){
        this.setState({solveItYourself: false})
    }

    async checkIfSolvable(newSudoku){
       let numberOfSolutions = await sudoku.checkIfSolvable(newSudoku)
       return numberOfSolutions
    }
    
    async updateCaptions(caption, captionColor){
        this.setState({caption: caption})
        this.setState({captionColor: captionColor})
    }
    
    async newSudoku(){
        this.setState({caption: "Sudoku Begin creating"})
        this.setState({captionColor: "blue"})
        this.setState({buttonDisable: true})
        this.setState({creationMode: true})
        
        await sleep(50)
        fullSudokuCreator.postMessage("") 
                  
        

        return
    }


render() {
    return (
        <>
            {!this.state.solveItYourself?
                <div className="box">
                    <div className="grid-container sudoku-grid">
                        <div className="sudoku-div">
                            <table className="sudokuTable">
                                <caption style={{background: this.state.captionColor, color: "white"}} >{this.state.caption}</caption>
                                <colgroup><col/><col/><col/></colgroup>
                                <colgroup><col/><col/><col/></colgroup>
                                <colgroup><col/><col/><col/></colgroup>
                                <tbody>
                                    {this.state.numbersSudoku.map((_value, index) => {
                                        return( 
                                            <tr key={index}>
                                                {this.state.numbersSudoku[index].map((value, index2) => {
                                                    const color = this.state.colors[index][index2]
                                                    const showWave = color === "blue" || color === "green"

                                                    if(this.state.numbersSudoku[index][index2]!==0) 
                                                        return(
                                                            <td key={index2} id={"sd"+index.toString()+index2.toString()} style={{color: color, position: "relative"}}>
                                                                {value}
                                                                {showWave?
                                                                    <span className='wave'>
                                                                    
                                                                    </span>
                                                                :
                                                                    null
                                                                }
                                                                
                                                            </td>
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
                            <button disabled={this.state.buttonDisable} className="button add" onClick={()=>this.setState({solveItYourself: true})}>Try It Yourself</button>
                            <button disabled={this.state.buttonDisable} onClick={()=> this.openModal()} className="button add">Create</button>
                            <button disabled={this.state.buttonDisable} onClick={()=> this.newSudoku()} className="button create">New</button>
                            <button disabled={this.state.buttonDisable} onClick={()=> this.beginSolving()} className="button solve">Solve</button>
                        </div>
                            <div className="label-area glass glass-rounded">
                                <div className='option-area'>
                                    <label>Speed of solving :   {this.state.speed}</label>
                                    <input type="range" min="0" max={MAX_SPEED_NUMBER} value={this.state.speed} 
                                        onChange={ (e) => this.setState({ speed: parseInt(e.target.value) })}  id="myRange"></input>
                                </div>
                                <div className='option-area' >
                                    <label htmlFor="difficultySelect">Method of Solving:</label>
                                    <select id="difficultySelect" value={this.state.methodNumber} onChange={(e)=>{this.setState({methodNumber: parseInt(e.target.value)})}}>
                                        {METHODS_OF_SOLVING.map((method, index) => (
                                        <option key={index} value={method.methodNumber}>
                                            {method.name}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='option-area' style={{paddingTop: "0.4rem"}}>
                                    <label htmlFor="methodSelect">Select Difficulty:</label>
                                    <select id="methodSelect" value={this.state.difficulty} onChange={(e)=>this.setState({difficulty: e.target.value})}>
                                        {DIFFICULTIES.map((difficulty, index) => (
                                        <option key={index} value={difficulty}>
                                            {difficulty}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="explaining-labels white">
                                <div className="small-box glass glass-rounded">
                                    <div> <div className="rectangle black"></div> - Base numbers</div>
                                    <div> <div className="rectangle red"></div> - Potential numbers/Brute force</div>
                                    <div> <div className="rectangle blue"></div> - Single possibility in row/col/square</div>
                                    <div> <div className="rectangle green"></div> - Single possibility in area</div>
                                </div>   
                            </div>
                        </div>
                        
                        
                    <NewSudokuModal checkIfSolvable={this.checkIfSolvable} changeSudoku={this.changeSudoku} closeModal={this.closeModal} modalIsOpen={this.state.modalIsOpen} />
                </div>
            :
                <SudokuUserSolver cancelFunction={this.cancelSolvingSudokuByUser} completedSudoku={this.state.sudokuWithAllNumbers} sudoku={this.state.numbersSudoku}/>
            }
        </>
    );
  }
}