import { sleep } from "../helpers/helpers"

export default class PathfinderA {
    constructor(rows, columns, points, updateVisuals, updateErrors, tileset, finishSolving, cleanLeftovers) {
        this.gScore = []
        this.fScore =  []
        this.rows = rows
        this.columns = columns
        this.finishSolving = finishSolving
        this.points = points
        this.tileset = tileset
        this.currentStartingPoint = points[0]
        this.currentEndingPoint = points[1]
        this.cycle = 0
        this.updateVisuals = updateVisuals
        this.updateErrors = updateErrors
        this.path = []
        this.foundPath = []
        this.cleanLeftovers = cleanLeftovers
        for(let i=0; i<rows; i++){
            this.gScore.push([])
            this.fScore.push([])
            this.path.push([])
            for(let j=0; j<columns; j++){
                this.gScore[i].push(Infinity)
                this.fScore[i].push(0)
                this.path[i].push({x: 0, y: 0})
            }
        }
    }


    async solveMaze(){

        for(let i=0; i<this.points.length-1;i++){
            this.cleanLeftovers()
            this.currentStartingPoint = this.points[this.cycle]
            this.currentEndingPoint = this.points[this.cycle+1]
            await this.findPath()
            
            this.cycle = this.cycle + 1
            this.foundPath = []
             
        }
        this.finishSolving()
    }

    async reconstructPath(x, y){
        
        this.updateVisuals(x, y, "purple")
        await sleep(200)
        if(x !== this.currentStartingPoint.x || y !== this.currentStartingPoint.y){
            await this.reconstructPath(this.path[x][y].x, this.path[x][y].y)
        }    
    }

    async findPath(){        
            for(let x=0; x<this.rows; x++){
                for(let y=0; y<this.columns;y++){
                    this.gScore[x][y]=Infinity
                    this.fScore[x][y]=this.countingFScore(x,y, this.currentEndingPoint)
                }
            }

            this.gScore[this.currentStartingPoint.x][this.currentStartingPoint.y] = 0
  
            await this.updateNeighbors(this.currentStartingPoint.x, this.currentStartingPoint.y)

            let foundPath = this.gScore[this.currentEndingPoint.x][this.currentEndingPoint.y]!==Infinity
            if(foundPath){
                await this.reconstructPath(this.currentEndingPoint.x, this.currentEndingPoint.y)
            }
            else{this.updateErrors("No path found")}
            //
        //    this.setState({buttonDisable: false})
          //  this.setState({canAdd: true})

        return
    }

    countingFScore(x, y, point){
        return Math.abs(x - point.x) + Math.abs(y - point.y)
    }

    async updateNeighbors(x, y){
        await sleep(100)
        let directionFunctions = [
            {id: 1, stepNextTile: {x: 1, y: 0}}, 
            {id: 2, stepNextTile: {x: -1, y: 0}}, 
            {id: 3, stepNextTile: {x: 0, y: 1}}, 
            {id: 4, stepNextTile: {x: 0, y: -1}}] 
        let directionsSorted = []

        if(x>this.currentEndingPoint.x){
            directionsSorted.push({x: -1, y: 0})
            
            directionFunctions = directionFunctions.filter(direction => direction.id !==2)
        }
        if(y>this.currentEndingPoint.y){
            directionsSorted.push({x: 0, y: -1})

            directionFunctions = directionFunctions.filter(direction => direction.id !==4)
        }
        if(x<this.currentEndingPoint.x){
            directionsSorted.push({x: 1, y: 0})

            directionFunctions = directionFunctions.filter(direction => direction.id !==1)
        }
        if(y<this.currentEndingPoint.y){
            directionsSorted.push({x: 0, y: 1})

            directionFunctions = directionFunctions.filter(direction => direction.id !==3)
        }
        
        directionFunctions.forEach(directionFunction => {
            directionsSorted.push(directionFunction.stepNextTile)
        })


        await Promise.all([
            this.checkTile(x+1, y,x,y), 
            this.checkTile(x-1, y,x,y),
            this.checkTile(x, y+1,x,y),
            this.checkTile(x, y-1,x,y)
        ]) 
       /* for (let i=0; i < directionsSorted.length; i++){
          this.checkTile(x+directionsSorted[i].x, y+directionsSorted[i].y,x,y)
        }*/
 
    }

    updatePath(x,y,newX,newY){
        this.path[x][y]={x: newX,y: newY}
    }

    async checkTile(x,y, comingX, comingY){

        let isTileOutsideOfBoard = x+1 > this.rows || y < 0 || y+1 > this.columns || x < 0
        if(isTileOutsideOfBoard) return
        
        if(this.tileset[x][y].name=== "Blockade") return
        
        
        let point = this.tileset[x][y].cost

        
        if(this.gScore[x][y] <= this.gScore[comingX][comingY] + point) return
        this.updateVisuals(x, y, "green") 
        this.gScore[x][y] = this.gScore[comingX][comingY]+point
        
        
        this.updatePath(x, y, comingX, comingY)
        
        let isShortestPossiblePathUsingThisPointShorterThanCurrentShortest = this.gScore[x][y] + this.fScore[x][y] < this.gScore[this.currentEndingPoint.x][this.currentEndingPoint.y]
    
        if (!isShortestPossiblePathUsingThisPointShorterThanCurrentShortest) return
        if (x === this.currentEndingPoint.x && y === this.currentEndingPoint.y) return
                
        await this.updateNeighbors(x, y)
              
    }

}