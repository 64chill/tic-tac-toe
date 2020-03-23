import React, { Component } from 'react'
import {Button, Modal } from 'react-bootstrap'
import { socket } from './socketStart'

export default class ChooseRoom extends Component {
    constructor(props){
        super(props);
        this.state = {
            show: false,
            setShow: false,
            roomList: [],
        }
        socket.on('openRooms', data => {
            if(data !== undefined){
                this.setState({
                    roomList : data
                })
            }
        });
        socket.emit("openRoomsRequest");
    }
    handleClose = () => this.setState({show:false});
    handleShow = () => this.setState({show:true});
    handleNewRoom = () =>{
        socket.emit('addNewRoom');
    }
    handleChooseRoom = (room_num) =>{
        socket.on("roomJoined", (data)=>{
            if(room_num !== undefined){
                this.props.roomHasChanged(data);
                this.handleClose();
            }
        });
        if(this.props.room_num !== -1 ){socket.emit("disconnect");}
        this.props.clearGameArea();
        socket.emit("joinRoom", room_num);
    }

    render() {
        let generateRoomList = this.state.roomList.map((elem)=>{
            return <span key={elem}><button onClick={() => this.handleChooseRoom(elem)}>{elem}</button> </span>
        })
        return (
            <div>
            <Button variant="primary" onClick={this.handleShow} disabled={this.props.disabled?true:false}>
                Choose A Room To Play
            </Button>

            <Modal show={this.state.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Rooms</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>Click on an empty room to start a game!</div>
                    <div>
                        {this.state.roomList.length !== 0 ?generateRoomList:null}
                    </div>
                    </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={this.handleNewRoom}>
                    Create A New Room
                </Button>
                </Modal.Footer>
            </Modal>
            </div>
        )
    }
}
