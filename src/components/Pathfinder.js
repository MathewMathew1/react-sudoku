


import React from "react";
import { sleep, getPartOfString } from "./functions";

export default class Pathfinder extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            rows: 17,
            columns: 30,
            canAddd: true,
            buttonDisable: false,
            whatToPlace: 0,
            colorToWhatToPlace: ["black", "orange", "brown"],
            pointForTerrain: {"white": 1, "brown": 3, "orange": 1,},
            colors: [],
            errors: [],
            points: [],
            gScore: [],
            fScore: [],
            path: [],
            endingPoint: [],
            beginningPoint: [],
            pathColors: []
        };
        
        for(let i=0; i<this.state.rows; i++){
            this.state.colors.push([])
            this.state.pathColors.push([])
            for(let j=0; j<this.state.columns; j++){
                this.state.colors[i].push("white")
                this.state.pathColors[i].push("none")
            }
        }
    }
    
    checkIfMouseIsPressed= (e) => {
        if(e.buttons!==1){
            return
        }
        this.changeTerrain(e)
    }

    changeTerrain(e){
        if(this.state.whatToPlace===0 || this.state.canAdd===false){
            return
        }
        let x = getPartOfString(e.target.id, `pt`, 1)
        x = parseInt(getPartOfString(x, `/`, 0))
        let y = parseInt(getPartOfString(e.target.id, `/`, 1))
        let copyArray = this.state.colors
        if(copyArray[x][y]!==this.state.colorToWhatToPlace[this.state.whatToPlace-1]){
            copyArray[x][y] = this.state.colorToWhatToPlace[this.state.whatToPlace-1]
            if(this.state.colorToWhatToPlace[this.state.whatToPlace-1]==="orange"){
                let copyPoints = this.state.points
                copyPoints.push([x,y])
                this.setState({points: copyPoints})
            }
            else{
                let copyPoints = this.state.points
                copyPoints= this.remove(copyPoints, [x,y])
                this.setState({points: copyPoints})
            }
        }
        else{
            copyArray[x][y] = "white"
            if(this.state.colorToWhatToPlace[this.state.whatToPlace-1]==="orange"){
                let copyPoints = this.state.points
                copyPoints= this.remove(copyPoints, [x,y])
                this.setState({points: copyPoints})
            }    
        }
        this.setState({colors: copyArray})

    }      
    
    remove = (arraY, value)=> {
        for( let a = 0; a < arraY.length; a++){
            if ( arraY[a][0] === value[0] && arraY[a][1] === value[1]) { 
                arraY.splice(a, 1); 
            }
        }
        return arraY
    }

    componentDidMount(){
        let gCopy = this.state.gScore
        let fCopy = this.state.fScore
        let pathCopy = this.state.path
        for(let x=0; x<this.state.rows; x++){
            gCopy.push([])
            fCopy.push([])
            pathCopy.push([])
            for(let y=0; y<this.state.columns;y++){
                gCopy[x].push([])
                fCopy[x].push([]) //this.countingFScore(x,y, this.state.points[0])
                pathCopy[x].push([])
            }
        }
        this.setState({gScore: gCopy})
        this.setState({fScore: fCopy})
        this.setState({path: pathCopy})
    }

    cleanTiles(){
        let copyArray = this.state.colors
        for(let i=0; i<this.state.rows; i++){
            for(let j=0; j<this.state.columns; j++){
                copyArray[i][j]="white"
            }
        }
        this.setState({colors: copyArray})
        let copyPathColors = this.state.pathColors
        for(let i=0; i<this.state.rows; i++){
            for(let j=0; j<this.state.columns; j++){
                copyPathColors[i][j]="none"
            }
        }
        this.setState({points: []})
        this.setState({pathColors: copyPathColors})
    }

    async findPath(){
        if(this.state.points.length===0){
            this.setState({errors: ["At least two points needed to find a path"]})
            return
        }
        this.setState({canAdd: false})
        this.setState({errors: []})
        this.setState({buttonDisable: true})
        // find path
        let gCopy = this.state.gScore
        let fCopy = this.state.fScore
        let pathCopy = this.state.path
        for(let x=0; x<this.state.rows; x++){
            for(let y=0; y<this.state.columns;y++){
                gCopy[x][y]=Infinity
                fCopy[x][y]=this.countingFScore(x,y, this.state.points[1])
                pathCopy[x][y]=[]
            }
        }
        gCopy[this.state.points[0][0]][this.state.points[0][1]] = 0
        this.setState({gScore: gCopy})
        this.setState({fScore: fCopy})
        this.setState({path: pathCopy})
        await this.setState({beginningPoint: [this.state.points[0][0],this.state.points[0][1]]})
        await this.setState({endingPoint: this.state.points[1]})
        await this.updateNeighbors(this.state.points[0][0], this.state.points[0][1])
        if(this.state.gScore[this.state.endingPoint[0]][this.state.endingPoint[1]]!==Infinity){
            this.ReconstructPath(this.state.points[1][0], this.state.points[1][1])
        }
        else{this.setState({errors: ["No path found"]})}
        this.setState({buttonDisable: false})
        this.setState({canAdd: true})
        return
    }
    
    async updateColor(x,y,color){
        let copyColors = this.state.colors
        copyColors[x][y]=color
        await this.setState({colors: copyColors})
        await sleep("30ms")
        return
    }

    async updatePathColor(x,y,color){
        let copyColors = this.state.pathColors
        copyColors[x][y]=color
        await this.setState({pathColors: copyColors})
        await sleep("25ms")
        return
    }

    updatePath(x,y,newX,newY){
        let pathCopy = this.state.path
        pathCopy[x][y]=[newX,newY]
        this.setState({path: pathCopy})
    }

    async updateNeighbors(x, y){
        if(x>this.state.endingPoint[0]){
            await this.goDown(x,y)
            if(y>this.state.endingPoint[1]){
                await this.goLeft(x,y)
                await this.goRight(x,y)
                await this.goUp(x,y)
            }
            else{
                await this.goRight(x,y)
                await this.goUp(x,y)
                await this.goLeft(x,y)
            }
        }
        else if(x<this.state.endingPoint[0]){
            await this.goUp(x,y)
            if(y>this.state.endingPoint[1]){
                await this.goLeft(x,y)
                await this.goRight(x,y)
                await this.goDown(x,y)
            }
            else{
                await this.goRight(x,y)
                await this.goDown(x,y)
                await this.goLeft(x,y)
            }
        }
        else if(y>this.state.endingPoint[1]){
            await this.goLeft(x,y)
            await this.goUp(x,y)
            await this.goDown(x,y)
            await this.goRight(x,y)
        }
        else{
            await this.goRight(x,y)
            await this.goLeft(x,y)
            await this.goUp(x,y)
            await this.goDown(x,y)
        }
    }
    
    async goDown(x,y){
        if( x > 0 ){  // DOWN
            if(this.state.colors[x-1][y]!== 'black'){
                let point = this.state.pointForTerrain[this.state.colors[x-1][y]]
                if(this.state.gScore[x - 1][y] > this.state.gScore[x][y] + point){
                    
                    let copyGScore = this.state.gScore    
                    copyGScore[x-1][y] = copyGScore[x][y]+point
                    await this.updatePathColor(x-1,y,"green")
                    await this.setState({gScore: copyGScore})  
                    
                    this.updatePath(x-1, y, x, y)
                    if (this.state.gScore[x - 1][y] + this.state.fScore[x - 1][y] < this.state.gScore[this.state.endingPoint[0]][this.state.endingPoint[1]]){
                        if (x - 1 !== this.state.endingPoint[0] || y !== this.state.endingPoint[1]){
                            await this.updateNeighbors(x - 1, y)
                        }
                    }
                }
            }
        }
    }

    async goUp(x,y){
        if( x+1 < this.state.rows){  // Up
            if(this.state.colors[x+1][y]!== 'black'){
                let point = this.state.pointForTerrain[this.state.colors[x+1][y]]
                if(this.state.gScore[x + 1][y] > this.state.gScore[x][y] + point){
                    
                    let copyGScore = this.state.gScore    
                    copyGScore[x+1][y] = copyGScore[x][y]+point
                    await this.updatePathColor(x+1,y,"green")
                    await this.setState({gScore: copyGScore})  
                    
                    this.updatePath(x+1, y, x, y)
                    if (this.state.gScore[x + 1][y] + this.state.fScore[x + 1][y] < this.state.gScore[this.state.endingPoint[0]][this.state.endingPoint[1]]){
                        if (x + 1 !== this.state.endingPoint[0] || y !== this.state.endingPoint[1]){
                            await this.updateNeighbors(x + 1, y)
                        }
                    }
                }
            }
        }
    }

    async goLeft(x,y){
        if( y > 0){  // down
            if(this.state.colors[x][y-1]!== 'black'){
                let point = this.state.pointForTerrain[this.state.colors[x][y-1]]
                if(this.state.gScore[x][y-1] > this.state.gScore[x][y] + point){
                    
                    let copyGScore = this.state.gScore    
                    copyGScore[x][y-1] = copyGScore[x][y]+point
                    await this.updatePathColor(x,y-1,"green")
                    await this.setState({gScore: copyGScore})  
                    
                    this.updatePath(x, y-1, x, y)
                    if (this.state.gScore[x][y-1] + this.state.fScore[x][y-1] < this.state.gScore[this.state.endingPoint[0]][this.state.endingPoint[1]]){
                        if (x !== this.state.endingPoint[0] || y-1 !== this.state.endingPoint[1]){
                            await this.updateNeighbors(x, y-1)
                        }
                    }
                }
            }
        }
    }

    async goRight(x,y){
        if( y+1 < this.state.columns){// up 
            if(this.state.colors[x][y+1]!== 'black'){         
                let point = this.state.pointForTerrain[this.state.colors[x][y+1]] 
                if(this.state.gScore[x][y+1] > this.state.gScore[x][y] + point){
                    
                    let copyGScore = this.state.gScore    
                    copyGScore[x][y+1] = copyGScore[x][y]+point
                    this.updatePathColor(x,y+1,"green")
                    await this.setState({gScore: copyGScore})  
                    
                    this.updatePath(x, y+1, x, y)
                    if (this.state.gScore[x][y+1] + this.state.fScore[x][y+1] < this.state.gScore[this.state.endingPoint[0]][this.state.endingPoint[1]]){
                        if (x !== this.state.endingPoint[0] || y+1 !== this.state.endingPoint[1]){
                            await this.updateNeighbors(x, y+1)
                        }
                    }
                }
            }
        }
    }

    ReconstructPath(x, y){
        this.updatePathColor(x,y,"purple")
        if(x !== this.state.beginningPoint[0] || y !== this.state.beginningPoint[1]){
            this.ReconstructPath(this.state.path[x][y][0], this.state.path[x][y][1])
        }    
    }

    countingFScore(x, y, point){
        return Math.abs(x - point[0]) + Math.abs(y - point[1])
    }

    handleChange(event) {
        this.setState({whatToPlace: event.target.value});
    }

    render() {
        return (
            <div>
                <div className="center">
                    <div className="custom-select">   
                        <select value={this.state.whatToPlace} onChange={(e) =>this.handleChange(e)}>
                            <option value="0">What to place:</option>
                            <option value="1">Blockade</option>
                            <option value="2">Starting point</option>
                            <option value="3">Mountain</option>
                        </select>
                    </div>
                    <button disabled={this.state.buttonDisable} onClick={()=> this.findPath()} className="button solve">Solve</button>
                    <button disabled={this.state.buttonDisable} onClick={()=> this.cleanTiles()} className="button create">Clean</button>
                    {this.state.errors.map((value) => {
                                        return(
                                            <div className="error">{value}</div>
                                        )
                                    })}
                </div>
                <div className="as">
                    <table className="labyrinth">
                        <tbody>
                            {Array.from(Array(this.state.rows), (e, i) => {
                                return( 
                                    <tr>
                                        {Array.from(Array(this.state.columns), (e, j) => {
                                            return(
                                                <td onClick={(e)=> this.changeTerrain(e)} onMouseOver={(e)=> this.checkIfMouseIsPressed(e)} style={{background: this.state.colors[i][j]}} id={"pt"+i.toString()+"/"+j.toString()}>
                                                    <div style={{background: this.state.pathColors[i][j]}}  className="path"></div>
                                                </td>
                                            )})}
                                    </tr>        
                                )})}
                        </tbody>

                    </table>
                </div>


            </div>
        )
    }
        
}