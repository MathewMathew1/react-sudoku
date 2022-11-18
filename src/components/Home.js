
import React from "react";

const ACCORDION_DATA = [
    {
      title: 'Sudoku',
      content: `Sudoku solver created in two different ways. One with simple backtracking alg aka brute force, simply inputting random numbers in fields.
      Second using human approach aka how i solve sudoku. There is also sudoku creator which will create new sudoku with less than 33 numbers filled.
        There is also speed-meter which controls how fast alg will solve sudoku(with maximum speed backtracking alg will solve it instantly since even with minimal possible sleep it takes super long).`
    },
    {
      title: 'Pathfinder',
      content: `Pathfinder will find shortest path between two points. Pathfinder works by storing minimal distance to a tile, visiting each neighbor tile, and either updating(when found shorter path) or returning.
      You can also place blockade(that blocks path) or mountain that cost 3x normal tile to travel. When more than 2 points are placed. Pathfinder will search from one to another.`
    },
    {
      title: 'Knight Tour',
      content: `Simple game. Place a knight, then ai will make a move with knight, then it is your turn. There is one rule, knight cant move to a tile that was already visited.
         Ps: game is rigged, you will always lose more info <a href="https://www.youtube.com/watch?v=ZGWZM8PcUlY&s&ab_channel=MindYourDecisions">at</a>.`
    }
  ];

class Home extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            accordionsOpen: [false, false, false],
        };
    }
    
    componentDidMount(){
        document.title = "Home"
    }

    showAccordion(index, value){
        console.log(value)
        this.setState(prevState => {
            return{...prevState, 
                accordionsOpen: [...prevState.accordionsOpen.slice(0, index),
                value,
                ...prevState.accordionsOpen.slice(index + 1)]
        }})
    }

    render() { 
        return (
            <div className="flex">
                <h1 >
                    About this site:
                </h1>
                <div style={{padding:"0.2rem"}}>
                    This site is created with react and bootstrap. It includes 3 different small projects.
                </div>
                <div className="accordion">
                    {ACCORDION_DATA.map((value, index) => {
                    return( 
                        <div key={`accordion ${index}`} className="accordion-item">
                            <div className="accordion-title" onClick={()=>this.showAccordion(index, !this.state.accordionsOpen[index])}>
                                <div>{value.title}</div>
                                <div>+</div>
                            </div>
                            {this.state.accordionsOpen[index] ?
                                    <div className="accordion-content" dangerouslySetInnerHTML={{__html: value.content}}>
                                        
                                    </div>
                                :
                                    null
                            }                  
                        </div>
                        )  
                    })}
                </div>
            </div>
        )
    }
}
 
export default Home;