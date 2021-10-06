
import './App.css';
import Sudoku from "./components/Sudoku";
import Pathfinder from "./components/Pathfinder";
import KnightTour from "./components/Knight-Tour";
import Home from './components/Home';

import {BrowserRouter as Router,Switch,Route} from "react-router-dom";

const changeSidebarStatus = () => {
  let topNav = document.getElementById("myTopNav");
  if (topNav.className === "topNav") {
    topNav.className += " responsive";
  } else {
    topNav.className = "topNav";
  }
}

function App() {
  
  return (
    <Router>
      <div className="App">
      <div className="topNav" id="myTopNav">
        <a className="active" href="/home" >Home</a>
        <a href="/sudoku" >Sudoku</a>
        <a href="/pathfinder">Pathfinder</a>
        <a href="/knight-tour">Knight Game</a>
        <div onClick={() => changeSidebarStatus()} href="#"  className="icon" >
          <div className="hamburger"></div>
          <div className="hamburger"></div>
          <div className="hamburger"></div>
        </div>
      </div>
          <Switch>
            <Route path="/Home">
                <Home/>
            </Route>
          </Switch>
          <Switch>
            <Route path="/sudoku">
                <Sudoku/>
            </Route>
          </Switch>
          <Switch>
            <Route path="/pathfinder">
                <Pathfinder/>
            </Route>
          </Switch>
          <Switch>
            <Route path="/knight-tour">
                <KnightTour/>
            </Route>
          </Switch>
        
      </div>
    </Router>
  );
}

export default App;
