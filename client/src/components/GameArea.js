import React, { Component } from 'react'
import { socket } from './socketStart'
import Alert from 'react-bootstrap/Alert'

const initState = {
  isNext : false, // flag if it is this player turn to play or no
  squares: Array(9).fill(null),// board fields
  players_count: 1, // wait for oponent to show up and then players = 2,
  winnerCombination : [],
  draw: false,
  gameEndText: "The Game Has ended!",
  oponentLeft: false
}

export default class GameArea extends Component {
    constructor(props){
        super(props);
        this.state = initState;
        this.handleClick = this.handleClick.bind(this); // binding onClick event

        socket.on("nextpChange", (data)=>{
          this.setState({isNext: data});
        });

        socket.on("gameFieldsChange", (data) =>{
          let sq = Array(9).fill(null);
          data["X"].forEach((e) => {
            sq[e] = "X";
          });
          data["O"].forEach((e) => {
            sq[e] = "O";
          })
          this.setState({squares: sq})
        });
        socket.on("gameIsFull", (data) =>{this.setState({players_count: 2})});
        // game over events ----------------------------------------------
        socket.on("gameEnd" , data=>{
          //WE HAVE A WINNER!
          this.setState({gameEndText : "The Game Has ended!", winnerCombination : data});
          this.props.showRoomButton();
        });

        socket.on("gameDraw" , data=>{
          //WE HAVE A DRAW!
          this.setState({gameEndText : "DRAW!", draw : data});
          this.props.showRoomButton();
        });

        socket.on("GameCanceled", (data)=>{
          //GAME CANCELED
          this.setState(initState);
          this.props.oponentLeft();
          this.props.showRoomButton();
        })
    }
    componentDidUpdate(prevProps, prevState, snapshot){
      if(prevProps.roomNumber !== this.props.roomNumber){
        this.setState(initState);
      }
    }
    handleClick(i) {
        socket.emit("send_move", {rid: this.props.roomNumber, move: i})
        return;
      }

    renderSquare(i) {
      let win_bool = false;
      if(this.state.winnerCombination.includes(i)){win_bool = true;}
        return (
          <Square
            value={this.state.squares[i]}
            win = {win_bool}
            draw = {this.state.draw}
            handleClick={this.handleClick}
            squareIndex = {i}
          />
        );
    }   

    render() {
      if (this.props.roomNumber === -1){
        return(<b>Please choose a room to play the game!</b>)
      } else{
        return (
            <div>
          <h2>You are player : {this.props.player_sign}</h2>
          {this.state.winnerCombination.length === 3 || this.state.draw?<Alert key="1" variant='danger'> {this.state.gameEndText} </Alert>:
          this.state.players_count === 1?<Alert key="1" variant='warning'>Please wait for an oponent to join this room! </Alert>:
          this.state.isNext === true?<Alert key="1" variant='success'>Your move! </Alert>:<Alert key="1" variant='warning'>Not your move! </Alert>}
          <div className="gameArea">
            <div className="board-row">
              {this.renderSquare(0)}
              {this.renderSquare(1)}
              {this.renderSquare(2)}
            </div>
            <div className="board-row">
              {this.renderSquare(3)}
              {this.renderSquare(4)}
              {this.renderSquare(5)}
            </div>
            <div className="board-row">
              {this.renderSquare(6)}
              {this.renderSquare(7)}
              {this.renderSquare(8)}
            </div>
          </div>
        </div>
        )
      }
    }
}

/// tic tac toe X/O Square Fields
class Square extends Component {
    constructor(props){
        super(props);
        this.handleSquareClick = this.handleSquareClick.bind(this);
    }

    handleSquareClick(){
        if(this.props.value === null ){
            this.props.handleClick(this.props.squareIndex);
        }
    }

    render() {
      if(this.props.win ){
        return (<button className="square winner" >{this.props.value}</button>)
      } else if(this.props.draw){
        return (<button className="square draw" >{this.props.value}</button>)
      }else{
        return (
        <button className="square" onClick={this.handleSquareClick}>
          {this.props.value}
        </button>
        )
      }
    }
}
