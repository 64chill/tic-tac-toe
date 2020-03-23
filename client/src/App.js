import React, {Component} from 'react';
import './App.css';
import ChooseRoom from './components/ChooseRoom'
import GameArea from './components/GameArea'
import Alert from 'react-bootstrap/Alert'
import { Modal } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

const initState = {
  room_no : -1,
  player_sign : "",
  oponentLeft: false,
  disableShowRoomButton:false,
};

class App extends Component {

  constructor(){
    super();
    this.state = initState;    
  }
  handleRoomChange = (data) =>{
    this.setState({room_no: data.no, player_sign: data.sign, disableShowRoomButton: true });    
    
  }

  setOponentLeftAlertFalse = () => {this.setState({oponentLeft: false})}
  setOponentLeftAlertTrue = () => {this.setState({oponentLeft: true, disableShowRoomButton: false})}
  handleClearGameArea = () =>{this.setState(initState);}
  oponentHasLeftTheGameArea = () =>{
    this.handleClearGameArea();
    this.setOponentLeftAlertTrue();
  }
  setShowRoomButtonTrue = () =>{ this.setState({disableShowRoomButton: false})}

  render() {
    return(
      <div className="App">
        <OponentLeftAlert show={this.state.oponentLeft} handleClose={this.setOponentLeftAlertFalse.bind(this)}></OponentLeftAlert>
        <Row>
          <Col></Col><Col>
          <ChooseRoom roomHasChanged={this.handleRoomChange.bind(this)} room_no={this.state.room_no} clearGameArea={this.handleClearGameArea.bind(this)} disabled={this.state.disableShowRoomButton}/>
          <GameArea
            roomNumber      = {this.state.room_no}
            player_sign     = {this.state.player_sign}
            oponentLeft     = {this.oponentHasLeftTheGameArea.bind(this)}
            showRoomButton  = {this.setShowRoomButtonTrue.bind(this)}/>
          </Col><Col></Col>
        </Row>        
      </div>
    )
  }
}

export default App;

// MODAL : notification that oponent has left the game
class OponentLeftAlert extends Component {
  handleClose = () => {this.props.handleClose();};
  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
        <Alert key={1} variant="info">The Game has been canceled - oponent left the game room!</Alert>
        </Modal.Header>
      </Modal>
    )
  }
}
