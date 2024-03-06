
import React from "react";
import { getPartOfString } from "./helpers/helpers"; 
import PathfinderA from "./Pathinders/PathfinderA";
import TILES from "./Pathinders/Tiles";

export default class Pathfinder extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            rows: 17,
            columns: 30,
            canAdd: true,
            buttonDisable: false,
            whatToPlace: TILES[0],
            tileset: [],
            errors: [],
            points: [],
            gScore: [],
            fScore: [],
            path: [],
            endingPoint: [],
            beginningPoint: [],
            pathColors: [],

        };
        
        this.updatePathColor = this.updatePathColor.bind(this)
        this.updateErrors = this.updateErrors.bind(this)
        this.finishSolving = this.finishSolving.bind(this)
        this.cleanGreen = this.cleanGreen.bind(this)
        
        for(let i=0; i<this.state.rows; i++){
            this.state.tileset.push([])
            this.state.pathColors.push([])

            const normalPath = TILES[0]
            for(let j=0; j<this.state.columns; j++){
                this.state.tileset[i].push(normalPath)
                this.state.pathColors[i].push("none")
            }
        }
    }

    componentDidMount(){
        document.title = "Pathfinder"
    }
    
    checkIfMouseIsPressed= (e) => {
        if(e.buttons!==1){
            return
        }
        this.changeTerrain(e)
    }

    removePoint(x, y){
        
        let indexOfRemovePoint = this.state.points.findIndex(point => point.x === x && point.y === y)
        let textNode = this.state.points[indexOfRemovePoint].content
        textNode.parentNode.removeChild(textNode);

        this.state.points.forEach((point, index) => {

            if(index <= indexOfRemovePoint) return

            let textNode = this.state.points[index].content
            
            textNode.nodeValue = index
        })
        this.setState(prevState => ({
            points: prevState.points.filter((item) => item.x !== x || item.y !== y)
        }))


    }

    changeTerrain(e){
        let x = getPartOfString(e.target.id, `pt`, 1)
        x = parseInt(getPartOfString(x, `/`, 0))
        let y = parseInt(getPartOfString(e.target.id, `/`, 1))

        if(this.state.canAdd===false) return

        if(this.state.tileset[x][y].color==="orange"){
            this.removePoint(x, y)
        }

        if(this.state.tileset[x][y].color===this.state.whatToPlace.color){
            this.setState((state)=>{
                let {tileset} = state
                tileset[x][y] = TILES[0]
                return {...state, tileset}
            })   

            return
        } 

        if(this.state.whatToPlace.color==="orange"){
            let content = document.createTextNode(`${this.state.points.length + 1}`);

            let appendTo = e.target
            e.target.childNodes.forEach((node)=> {
                console.log(node.className)
                if(node.classList.contains('path')){
                    appendTo = node
                }
            })
            console.log(e.target.childNodes)
            appendTo.appendChild(content) 
            this.setState({points: [...this.state.points, {x: x, y: y, content: content}]})
        }

        this.setState((state)=>{
            let {tileset} = state
            tileset[x][y] = this.state.whatToPlace
            return {...state, tileset}
        })   

    }      
    
    remove = (arraY, value)=> {
        for( let a = 0; a < arraY.length; a++){
            if ( arraY[a][0] === value[0] && arraY[a][1] === value[1]) { 
                arraY.splice(a, 1); 
            }
        }
        return arraY
    }

    cleanPath(){
        this.setState((state)=>{
            let {pathColors} = state

            pathColors.forEach((color, index)=>{
                pathColors[index].forEach((color2, index2)=>{
                    pathColors[index][index2] = "none"
                })
            })
            return {pathColors}
        })
    }

    cleanTiles(){
        let tilesetNew = []

        for(let i=0; i<this.state.rows; i++){
            tilesetNew.push([])


            for(let j=0; j<this.state.columns; j++){
                tilesetNew[i].push(TILES[0])
            }
        }
        for(let i=0; i<this.state.points.length; i++){
            let textNode = this.state.points[i].content
            textNode.parentNode.removeChild(textNode);
        }

        this.setState({points: []})

        this.cleanPath()
        this.setState({tileset: tilesetNew})
    }

    async findPath(){
        if(this.state.points.length<2){
            this.updateErrors(["At least two points needed"])
            return
        }
        this.cleanPath()
        this.setState({buttonDisable: true})
        this.setState({canAdd: false})
        let Pathfinder = new PathfinderA(this.state.rows, this.state.columns, this.state.points, 
            this.updatePathColor, this.updateErrors, this.state.tileset, this.finishSolving, this.cleanGreen)
        Pathfinder.solveMaze()
    }
    
    async updateErrors(errorMessage){
        this.setState({errors: [errorMessage]})
    }

    async cleanGreen(){
        this.setState((state)=>{
            let {pathColors} = state

            pathColors.forEach((color, index)=>{
                pathColors[index].forEach((color2, index2)=>{
                     if(pathColors[index][index2]==="green") pathColors[index][index2] = "none"
                })
            })
            return {pathColors}
        })
    }

    async updatePathColor(x,y,color){
        if(this.state.pathColors[x][y]==="purple"){
            return
        }

        this.setState((state)=> {
            let {pathColors} = state
            pathColors[x][y] = color
            return {...state, pathColors: pathColors}
        })
 
        return
    }

    finishSolving(){
        this.setState({canAdd: true})
        this.setState({buttonDisable: false})
    }

    handleChange(e) {
        this.setState({whatToPlace: TILES[e.target.value]});
    }
    
    
    render() {
        return (
            <div className="box">
                <div className="pathfinder-container">
                    <div className="button-area">
                        <div className="options-buttons-area">
                           
                                <div className="custom-select">   
                                    <select  onChange={(e) => this.handleChange(e)}>
                
                                        {TILES.map((value, index) => {
                                            return( 
                                                <option  key={`tiles ${index}`} value={index}>{value.name}</option>        
                                            )})}
                                    </select>
                                </div>
                            
                                <button disabled={this.state.buttonDisable} onClick={()=> this.findPath()} className="button solve">Solve</button>
                                <button disabled={this.state.buttonDisable} onClick={()=> this.cleanTiles()} className="button create">Clean</button>
                                   
                        </div>
                        <div>
                            {this.state.errors.length>0?
                                <div className="glass">
                                    {this.state.errors.map((value, index) => {
                                    return(
                                        <div className="" key={`error ${index}`}>{value}</div>
                                    )
                                    })}
                                </div>
                            :
                                <></>
                            }
                        </div>
                    </div>
           
                    <div className="table-labyrinth-container">
                        <table className="labyrinth">
                            <tbody>
                                {[...Array(this.state.rows)].map((_e, i) => {
                                    return( 
                                        <tr key={`row${i}`}>
                                            {[...Array(this.state.columns)].map((_e, j) => {
                                                const color = this.state.tileset[i][j].color
                                                const tileIsEmpty = color === "white"
                                                let additionalClasses = tileIsEmpty? `pathFull`: `` 
                                              
                                                
                                                return(
                                                    <td 
                                                        key={`tile${j}${i}`} 
                                                        onClick={(e)=> this.changeTerrain(e)} 
                                                        onMouseOver={(e)=> this.checkIfMouseIsPressed(e)} 
                                                        style={{background: this.state.tileset[i][j].color}} 
                                                        id={"pt"+i.toString()+"/"+j.toString()}>
                                                        <div style={{background: this.state.pathColors[i][j]}}  className={`path ${additionalClasses}`}>
                                                           
                                                        </div>
                                                        {this.state.pathColors[i][j] === "green"?
                                                            <span className='wave wave-green'></span>
                                                        :
                                                            <>
                                                                {this.state.pathColors[i][j] === "purple"?
                                                                    <span className='wave'></span>
                                                                :
                                                                    null
                                                                }
                                                            </>
                                                        }
                                                    </td>
                                                )})}
                                        </tr>        
                                    )})}
                            </tbody>
                        </table>
                    </div>
               
                    <div className="agenda-labels white">
                        <div className="small-box glass glass-rounded">
                            <div> <div className="rectangle black"></div> - Impassable tile</div>
                            <div> <div className="rectangle brown"></div> - Mountain = 3 cost of normal tile</div>
                            <div> <div className="rectangle orange"></div> - Tiles to find a path</div>
                            <div> <div className="rectangle green"></div> - Tiles visited by algorithm at least once</div>
                            <div> <div className="rectangle purple"></div> - Shortest path between points</div>
                        </div>   
                    </div>
                </div>
            </div>
        )
    }
        
}