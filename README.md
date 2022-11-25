### Technologies used:
  React(Javascript)
  Bootstrap

# About Site:
    My first react project, and 2 with Javascript.
    Site combines my three diffrent small projects that i wrote in either python or c++, and then "translated" to javascript

## Sudoku:
    Sudoku solver created in two different ways. One with simple backtracking alg aka brute force, simply inputting random numbers in fields. 
    Second using human approach aka how i solve sudoku. There is also sudoku creator which will create new sudoku with less than 33 numbers filled. 
    There is also speed-meter which controls how fast 
    alg will solve sudoku(with maximum speed backtracking alg will solve it instantly since even with minimal possible sleep it takes super long).

    More in depth of how "human aproach" works
    For each empty tile alg will create list of possible numbers(number is possible when there is no same number in row column or sqaure)
  
    Loop
      Then it checks if in some tile there is only one possiblity. if it is the case, then it puts this possible in known numbers
      Then it checks if number can fit in only one row/column/sqaure. if it is the case, it fils that spot
      If both of above wont find a number in cycle then
        alg will check if some number in sqaure can be only in one row or column and then remove it from possiblities in other tiles from that row or column
        in similar fashion like above, alg will check if some number is posible in only one sqaure in row or column and then remove it from possiblites from diffrent tiles in this square
      After failing to find number in ten diffrent cycles, alg will "give up".

 ## Pathfinder:
      Pathfinder will find shortest path between two points. 
      Pathfinder works by storing minimal distance to a tile, visiting each neighbor tile, and either updating(when found shorter path) or returning. 
      You can also place blockade(that blocks path) or mountain that cost 3x normal tile to travel. When more than 2 points are placed, 
      Pathfinder will search from one point to another.
  
 ## Knight game:
      Simple game. Place a knight, then ai will make a move with knight, then it is your turn. There is one rule, knight cant move to a tile that was already visited. 
      Ps: game is rigged, you will always lose more info at.

  
