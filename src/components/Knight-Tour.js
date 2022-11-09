import React from "react";
import { getPartOfString, containsObject, sleep }  from "./functions";
import knight from "../knight.png"


export default class KnightTour extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            rows: 8,
            columns: 8,
            knightWasInThisTile: [],
            aiTurn: true,
            rowNames: ["A", "B", "C", "D", "E", "F", "G", "H"],
            highlightTile: [],
            knightPosition: [0,0],
            canDragKnight: false,
            turn: 1,
            labelDescription: "Game not started yet",
            labelColor: "blue",
            gameStarted: false,
            bestScore: 0,
        };
        for(let i=0; i<this.state.rows;i++){
            this.state.knightWasInThisTile.push([])
            this.state.highlightTile.push([])
            for(let j=0; j<this.state.columns;j++){
                this.state.knightWasInThisTile[i].push(false)
                this.state.highlightTile[i].push(false) 
            }
        }
    }

    componentDidMount(){
        let idOfNewElement = "tile" + this.state.knightPosition[0] + "/" + this.state.knightPosition[1]
        let knight = document.getElementById("knight")
        let newTd = document.getElementById(idOfNewElement)
        newTd.appendChild(knight)
        
        if(localStorage.getItem("Best Score")){
            this.setState({bestScore: localStorage.getItem("Best Score")})
        }
    }
    
    highlightPossibleTilesForKnight(){
        if(!this.state.gameStarted || !this.state.canDragKnight) return
        
        let x = this.state.knightPosition[0]
        
        let y = this.state.knightPosition[1]
        
        let firstAxisChange = [-2, 2]
        let secondAxisChange = [-1, 1]
        let copyArray = this.state.highlightTile

        for(let i=0; i<firstAxisChange.length;i++){
            for(let j=0; j<secondAxisChange.length;j++){
                let tileExist = 8 > x + firstAxisChange[i] && x + firstAxisChange[i] >= 0 && 8 > y + secondAxisChange[j] && y + secondAxisChange[j] >= 0
                if(tileExist){
                    let tileWasNotVisited = !this.state.knightWasInThisTile[x + firstAxisChange[i]][y + secondAxisChange[j]]
                    if(tileWasNotVisited) copyArray[x + firstAxisChange[i]][y + secondAxisChange[j]] = true
                }
                tileExist = 8 > x + secondAxisChange[i] && x + secondAxisChange[i] >= 0 && 8 > y + firstAxisChange[j] && y + firstAxisChange[j] >= 0
                if(tileExist){
                    let tileWasNotVisited = !this.state.knightWasInThisTile[x + secondAxisChange[i]][y + firstAxisChange[j]]
                    if(tileWasNotVisited) copyArray[x + secondAxisChange[i]][y + firstAxisChange[j]] = true
                }
            }
        }
        this.setState({highlightTile: copyArray})
       
    }

    clearHighlights(){
        let copyArray = this.state.highlightTile
        for(let i=0; i<this.state.rows;i++){
            for(let j=0; j<this.state.columns;j++){
                copyArray[i][j] = false
            }
        }
        this.setState({highlightTile: copyArray})
    }

    validMove(newX, newY, oldX, oldY){
        let firstAxisChange = [-2, 2]
        let secondAxisChange = [-1, 1]
        for(let i=0; i<firstAxisChange.length;i++){
            for(let j=0; j<secondAxisChange.length;j++){
                let canKnightMoveToThiTile = oldX + firstAxisChange[i]===newX && oldY + secondAxisChange[j] === newY
                if(canKnightMoveToThiTile){
                    return true
                }
                canKnightMoveToThiTile = oldX+secondAxisChange[i] === newX && oldY + firstAxisChange[j] === newY
                if(canKnightMoveToThiTile){
                    return true
                }
            }
        }
        return false
    }

    async reset(){
        let copyArray = this.state.knightWasInThisTile
        for(let i=0; i<this.state.rows; i++){
            for(let j=0; j<this.state.columns; j++){
                copyArray[i][j] = false
            }
        }
        this.setState({labelColor: "blue"})
        this.setState({knightWasInThisTile: copyArray})
        this.setState({turn: 1})
        this.setState({canDragKnight: false})
        this.setState({labelDescription: "Game not started yet"})
        this.setState({gameStarted: false})
        this.clearHighlights()
        
    }

    async startGame(){
        await this.reset()
        this.setState({gameStarted: true})
        this.setState({labelDescription: "Game started"})
        this.aiMove()
    }

    placeKnight(e){
        let x = getPartOfString(e.target.id, `tile`, 1)
        x = parseInt(getPartOfString(x, `/`, 0))
        let y = parseInt(getPartOfString(e.target.id, `/`, 1))

        if(this.state.gameStarted === false){
            
            let idOfNewElement = "tile" + x + "/" + y
            let knight = document.getElementById("knight")
            let newTd = document.getElementById(idOfNewElement)
            newTd.appendChild(knight)

            this.setState({knightPosition: [x,y]})   
        }
        else if(this.state.canDragKnight) this.moveKnight(e, x,y)

        
    }

    getCoordinates(e){
        let x = getPartOfString(e.target.id, `tile`, 1) // it would be wise idea to check if e.target belongs to table if there would be more droppings area
        x = parseInt(getPartOfString(x, `/`, 0))
        let y = parseInt(getPartOfString(e.target.id, `/`, 1))
        this.moveKnight(e, x, y)
    }

    moveKnight(e, x, y){
        this.clearHighlights()
        const isThisValidMoveAndKnightWasNotToThisTileBefore = this.validMove(x, y, this.state.knightPosition[0], this.state.knightPosition[1]) && !this.state.knightWasInThisTile[x][y]
        if(isThisValidMoveAndKnightWasNotToThisTileBefore){
            this.setState({canDragKnight: false})
            
            let copyBeenTiles = this.state.knightWasInThisTile
            copyBeenTiles[this.state.knightPosition[0]][this.state.knightPosition[1]] = true
            this.setState({knightWasInThisTile: copyBeenTiles})

            let copyKnightPos = this.state.knightPosition
            copyKnightPos[0] = x
            copyKnightPos[1] = y
            this.setState({knightPosition: copyKnightPos})

            let idOfNewElement = "tile" + x + "/" + y
            let knight = document.getElementById("knight")
            let newTd = document.getElementById(idOfNewElement)
            newTd.appendChild(knight)

            this.setState({turn: this.state.turn+1})

            this.aiMove()
            return
        }
    }
    
    allowDrop(e) {
        e.preventDefault();
    }

    async aiMove(){
        await sleep(1000)
        if(this.state.gameStarted === false) return
        let rowToMove
        let columnToMove
        if( this.state.knightPosition[0] % 2 === 0){
            rowToMove = this.state.knightPosition[0] + 1
        }
        else{
            rowToMove = this.state.knightPosition[0] - 1
        }
        const yToGoDownTheBoard = [2, 3, 6, 7]
        if( containsObject(yToGoDownTheBoard, this.state.knightPosition[1])){
            columnToMove = this.state.knightPosition[1] - 2
        }
        else{
            columnToMove = this.state.knightPosition[1] + 2
        }
        

        let idOfNewElement = "tile" + rowToMove + "/" + columnToMove
        let knight = document.getElementById("knight")
        let newTd = document.getElementById(idOfNewElement)
        newTd.appendChild(knight)

        

        let copyBeenTiles = this.state.knightWasInThisTile
        copyBeenTiles[this.state.knightPosition[0]][this.state.knightPosition[1]] = true
        this.setState({knightWasInThisTile: copyBeenTiles})
        
        this.setState({knightPosition: [rowToMove, columnToMove]})
        this.setState({turn: this.state.turn+1})
        
        if(!this.checkingForDefeat()){
            this.setState({labelDescription: "Your turn"})
            this.setState({canDragKnight: true})
        }
        return
    }
    


    checkingForDefeat(){
        let firstAxisChange = [-2, 2]
        let secondAxisChange = [-1, 1]
        for(let i=0; i<firstAxisChange.length;i++){
            for(let j=0; j<secondAxisChange.length;j++){
                let tileExist = 8 > this.state.knightPosition[0] + firstAxisChange[i] && this.state.knightPosition[0] + firstAxisChange[i] >= 0 && 8 > this.state.knightPosition[1] + secondAxisChange[j] && this.state.knightPosition[1] + secondAxisChange[j] >= 0
                if(tileExist){
                    let tileWasNotVisited = !this.state.knightWasInThisTile[this.state.knightPosition[0] + firstAxisChange[i]][this.state.knightPosition[1] + secondAxisChange[j]]
                    if(tileWasNotVisited) return false
                }
                tileExist = 8 > this.state.knightPosition[0] + secondAxisChange[i] && this.state.knightPosition[0] + secondAxisChange[i] >= 0 && 8 > this.state.knightPosition[1] + firstAxisChange[j] && this.state.knightPosition[1] + firstAxisChange[j] >= 0
                if(tileExist){
                    let tileWasNotVisited = !this.state.knightWasInThisTile[this.state.knightPosition[0] + secondAxisChange[i]][this.state.knightPosition[1] + firstAxisChange[j]]
                    if(tileWasNotVisited) return false
                }
            }
        }
        this.setState({labelDescription: "Your have lost"})
        this.setState({labelColor: "red"})
        this.setState({gameStarted: false})
        this.setBestScore()
        return true
    }


    setBestScore(){
        if(this.state.turn < this.state.bestScore) return
        localStorage.setItem("Best Score", this.state.turn)
        this.setState({bestScore: this.state.turn})
    }


    render() {
        return (
            <div className="box">
                <img onDragEnd={() => this.clearHighlights()} id="knight" 
                    src={knight} alt="knight" draggable={this.state.canDragKnight} 
                    onDragStart={(e)=> this.highlightPossibleTilesForKnight(e)}  
                    onClick={() => this.highlightPossibleTilesForKnight()}/>
                <div className="grid-container chess-grid">
                    <div className="chessBoard-div" >
                        <table className="chessBoard">
                            <caption style={{background: this.state.labelColor, color: "white"}} >{this.state.labelDescription}</caption>
                            <tbody>
                                {Array.from(Array(this.state.rows), (e, i) => {
                                    return( 
                                        <tr key={i}>
                                            {Array.from(Array(this.state.columns), (e, j) => {
                                                return(
                                                    <td key={i+j} id={"tile"+i.toString()+"/"+j.toString()} 
                                                    onClick={(e) => this.placeKnight(e)} onDrop={(e) => this.getCoordinates(e)} onDragOver={(e) => this.allowDrop(e)}>
                                                            {this.state.knightWasInThisTile[i][j]  &&<div className="forbiddenMoves"></div>}
                                                            {this.state.highlightTile[i][j]  &&<div className="allowedMoves"></div>}
                                                    </td>
                                                )
                                            })}
                                            <td >{8-(i)}</td>
                                        </tr>          
                                    )
                                })}
                                <tr>
                                    {this.state.rowNames.map((value, index2) => {
                                        return(
                                            <td key={index2} >{value}</td>
                                        )
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>    
                    <div className="labels">
                        <div className="right">
                            <div className="very-small-box">
                                Best Score: Loss {this.state.bestScore}
                            </div>
                            <div className="very-small-box">
                                turn: {this.state.turn}
                            </div>
                            <button disabled={this.state.gameStarted} onClick={()=> this.startGame()} className="button solve">Start</button>
                            <button onClick={()=> this.reset()} className="button create">Reset</button>
                        </div>
                    </div>
                    <div className="label-rules">
                        <div className="small-box">
                            <h3>Rules of Game: </h3>
                            Place knight on tile and press start.Ai will move knight to different tile, then it is your turn. You/Ai cannot move knight to tile that was already visited. Red boxes on tiles symbolize, that this tile was already visited. First player that cannot find a move loses.
                        </div> 
                    </div> 
                </div>              
            </div>
        )
    }
        
}