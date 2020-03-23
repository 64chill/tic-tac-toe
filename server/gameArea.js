winnerCombinations = [ // index of fields where should X or O be for a winner to win
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];

function isDraw(p1_moves, p2_moves){
    let total = p1_moves.length + p2_moves.length;
    rval = total === 9?true:false; //if all fields are filled and there is no winner
    return rval;
}

function findWinner(p_moves){
    win = false;
    winnerCombinations.forEach(winnerCombination=>{ // check if player has won the game
        if( p_moves.includes(winnerCombination[0]) &&
            p_moves.includes(winnerCombination[1]) &&
            p_moves.includes(winnerCombination[2])
        ){
            win = winnerCombination;
            return;
        }
    });
    return win;
}

// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

const gameArea = {
        roomList : [],
        /*
        [
            {"no" : 1 , "full": false , p1: "" , p2: "" , p1_moves :[], p2_moves:[], nextp: ""},
            {"no" : 2 , "full": false,  p1: "" , p2: "", p1_moves :[], p2_moves:[]}, nextp: ""},
        ]
        */

    addRoom(){
        // get the last room number
        //length-1
        if(this.roomList.length === 0 ){
            this.roomList.push({"no": 1, "full" : false, p1: -1 , p2: -1, p1_moves :[], p2_moves:[]});
        } else {
            newNo = this.roomList[this.roomList.length-1]["no"] + 1;
            this.roomList.push({"no": newNo, "full" : false, p1: -1 , p2: -1, p1_moves :[], p2_moves:[]});
        }
    },
    joinRoom(player_id, room_id){
        let found = this.roomList.find((elem)=>elem.no === room_id);
        if(typeof found === undefined){return false;} // if not found
        if(found.p1 === player_id ){return false;} // check if player1 wants to rejoin
        if(found.p2 === player_id ){return false;} // check if player2 wants to rejoin
        if (found.p1 === -1){
            found.p1 = player_id;
            found.nextp = player_id;
            return {join_sign : "X", nextp: null, gamefull:false};
        } else if(found.p2 === -1){
            found.p2 = player_id;
            found.full = true;
            return {join_sign : "O", nextp: found.nextp, gamefull:true, p1:found.p1, p2:found.p2};
        }
        return false;
    },
    getFreeRoomsNoList(){
        r_arr = [];
        this.roomList.forEach((elem)=>{
            if(elem.full === false){ // if elem is empty
                // get its number
                r_arr.push(elem.no);
            }
        });
        return r_arr;
    },
    sendMove(room_id, player_id, pMoveNum){
        let currentGame = this.roomList.find((elem)=>elem.no === room_id);
        if(typeof currentGame === undefined){return false;} // if not found
        if(currentGame.p1 === -1){return false;} // if player1 not found
        if(currentGame.p2 === -1){return false;} // if player2 not found
        if(currentGame.nextp !== player_id){return false} // player is not next player to make a move

        is_p1PlayedThisMove = currentGame.p1_moves.find((e)=> e === pMoveNum)
        is_p2PlayedThisMove = currentGame.p2_moves.find((e)=> e === pMoveNum)
        if (is_p1PlayedThisMove || is_p2PlayedThisMove ){
            return false; // move is already played
        }
        let win = false;
        if(currentGame.p1 === player_id){
            currentGame.p1_moves.push(pMoveNum);
            currentGame.nextp = currentGame.p2;
            win = findWinner(currentGame.p1_moves);
        } else if (currentGame.p2 === player_id){
            currentGame.p2_moves.push(pMoveNum);
            currentGame.nextp = currentGame.p1;
            win = findWinner(currentGame.p2_moves);
        } else {return false} // player is not part of the game
        isDraw(currentGame.p1_moves, currentGame.p2_moves);
        return {"X" : currentGame.p1_moves , "O" : currentGame.p2_moves, nextp: currentGame.nextp , p1: currentGame.p1, p2: currentGame.p2, win: win, draw: isDraw(currentGame.p1_moves, currentGame.p2_moves)};
    },
    disconnectPlayer(pid){
        // on disconnect remove all players from the room
        // then remove the room from roomList
        currentRoom = this.roomList.find((room)=> room.p1 === pid || room.p2 === pid);
        let otherplayer = false;
        if(currentRoom){ // if not undefiend / null
            if(currentRoom.p1 === pid){otherplayer = currentRoom.p2;}
            if(currentRoom.p2 === pid){otherplayer = currentRoom.p1;}
            this.roomList.splice(this.roomList.indexOf(currentRoom)); // remove room
        } 
        return otherplayer;
    }
}

module.exports = gameArea;