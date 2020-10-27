
function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}


function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false
  if (playerColor !== game.turn()){
    return false;
  }
  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1 ) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1 )) {
    return false
  }
}

function onDrop (source, target) {
  removeGreySquares()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
}

function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
//  if (player_color !== game.turn()) {
//    return false
//  }

  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen());
  socket.emit('moved', game.fen());
  gameData['board'] = game.fen();

}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

function showGameSetup(status){
    if (!status){
        document.getElementById('setupForm').style = 'display: block'
    }
    else{
        document.getElementById('cancelButton').style = 'display: block'
        document.getElementById('setupForm').style = 'display: none'
    }
    if (username === ''){
        document.getElementById('userForm').style = 'display: block'
    }
}

function createGame(){
    var mt = parseInt(document.getElementById('moveTime').value)
    var bt = parseInt(document.getElementById('bankTime').value)

    if (Number.isInteger(mt) && Number.isInteger(bt)){
        socket.emit('create', {movetime: mt, banktime: bt})
        document.getElementById('cancelButton').style = 'display: block'
        document.getElementById('setupForm').style = 'display: none'

    }
    else{
        alert('Invalid Settings');
    }

}

function cancelGame(){
    socket.emit('cancel')
    document.getElementById('setupForm').style = 'display: block'
    document.getElementById('selectPieces').style = 'display: none';
    document.getElementById('wrapper').style = 'display: none';

}

function setName(){
    user_input = document.getElementById('name').value;
    if (user_input !== ''){
        username = user_input;
        document.getElementById('userForm').style = 'display: none';
        document.getElementById('changeName').style = 'display: block';
    }
    else{
        alert('Enter Username');
    }
}

function changeName(){
    document.getElementById('changeName').style = 'display: none';
    document.getElementById('userForm').style = 'display: block';
}

function update(){
    showGameSetup(gameData['isgame'])
    if (gameData['isgame']){
        document.getElementById('selectPieces').style = 'display: block';
        document.getElementById("winner").innerHTML = '';

    }
    else{
        document.getElementById('wrapper').style = 'display: none';
    }

    if (gameData['isgame'] && gameData['isstarted'] !== true){
        document.getElementById('wplayer').textContent = gameData['wplayer']
        document.getElementById('bplayer').textContent = gameData['bplayer']
        if (username === gameData['wplayer'] || username === gameData['bplayer']){
            document.getElementById('leave').style = 'display: block'
        }
        else{
            document.getElementById('leave').style = 'display: none'
        }
    }
    if (gameData['isgame'] && gameData['isstarted'] !== true && gameData['wplayer'] !== '' && gameData['bplayer'] !== ''
        && (username === gameData['wplayer'] || username === gameData['bplayer'])){
        if(playerColor === ''){
            if (username === gameData['wplayer']){
                playerColor = 'w'
            }
            if (username === gameData['bplayer']){
                playerColor = 'b'
            }

        }
        document.getElementById('start').style = 'display: block'

    }
    if (gameData['isgame'] && gameData['isstarted']){
//        if (game.fen() !== gameData['board']){
//            board.position(gameData['board'])
//            game.load(gameData['board'])
//
//        }
        var b = document.getElementById("wrapper");
        if (window.getComputedStyle(b).display === "none") {
            board.position(gameData['board'])
            game.load(gameData['board'])
            b.style = 'display: block'
            if (username == gameData['wplayer']){
                board.orientation('white');
            }
            if (username == gameData['bplayer']){
                board.orientation('black');
            }
        }
        var piecesForm = document.getElementById("selectPieces");
        if (window.getComputedStyle(piecesForm).display === "block") {
            piecesForm.style = 'display: none'
        }
        var tdwhite = document.getElementById("tdwhite");
        if (tdwhite.innerHTML.trim() === ''){
            tdwhite.innerHTML = gameData['wplayer']
        }
        var tdblack = document.getElementById("tdblack");
        if (tdblack.innerHTML.trim() === ''){
            tdblack.innerHTML = gameData['bplayer']
        }
        document.getElementById("tdmove").innerHTML = gameData['turn']
        document.getElementById("wmt").innerHTML = Math.round(gameData['wmt'])
        document.getElementById("bmt").innerHTML = Math.round(gameData['bmt'])
        document.getElementById("wbt").innerHTML = Math.round(gameData['wbt'])
        document.getElementById("bbt").innerHTML = Math.round(gameData['bbt'])

        if (gameData['wbt'] <= 0){
            document.getElementById("winner").innerHTML = 'The winner is ' + gameData['bplayer']
            game_over()
        }
        if (gameData['bbt'] <= 0){
            document.getElementById("winner").innerHTML = 'The winner is ' + gameData['wplayer']
            game_over()
        }
        if (game.in_checkmate()){
            document.getElementById("winner").innerHTML = 'The winner is the one with checkmate'
            game_over()
        }
        else if (game.game_over()){
            document.getElementById("winner").innerHTML = 'Draw'
            game_over()
        }
    }

}
function game_over(){
    playerColor = ''
    socket.emit('gameover')

}

function selectPieces(color){
    if (username !== ''){
        socket.emit('playerselect', {color:color, username:username})
    }
    else{
        alert('Username Error')
    }
}

function leaveGame(){
    socket.emit('leave', data=username)
}

function startGame(){
    socket.emit('startgame')
}



