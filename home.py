from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import json

from simple_delay import SimpleDelay

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# game data object
GAME_DATA_INIT = game_data = {
    'isgame': False,
    'isstarted': False,
    'wplayer': '',
    'bplayer': '',
    'turn': '',
    'wmt' : 0,
    'bmt' : 0,
    'wbt' : 0,
    'bbt' : 0,
}
game_data = GAME_DATA_INIT.copy()
time_keeper = None

@app.route('/')
def index():
    return render_template('home.html', data=game_data)


@socketio.on('create')
def create_game(data):
    global time_keeper
    game_data['isgame'] = True
    game_data['board'] = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    game_data['movetime'] = int(data['movetime'])
    game_data['banktime'] = int(data['banktime'])
    game_data['turn'] = 'white'
    game_data['wmt'] = game_data['movetime']
    game_data['bmt'] = game_data['movetime']
    game_data['wbt'] = game_data['banktime']
    game_data['bbt'] = game_data['banktime']
    time_keeper = SimpleDelay(game_data['movetime'], game_data['banktime'])


@socketio.on('cancel')
def cancel_game():
    global game_data, time_keeper
    time_keeper = None
    game_data = GAME_DATA_INIT.copy()


@socketio.on('request')
def request():
    if time_keeper and time_keeper.started:
        game_data['wmt'],game_data['wbt'],game_data['bmt'],game_data['bbt']=time_keeper.get_times()
    emit('update', game_data)


@socketio.on('playerselect')
def player_select(data):
    assign_player(data['color'], data['username'])


@socketio.on('leave')
def leave(data):
    if game_data['wplayer'] == data:
        game_data['wplayer'] = ''
    if game_data['bplayer'] == data:
        game_data['bplayer'] = ''


@socketio.on('startgame')
def start_game():
    game_data['isstarted'] = True
    time_keeper.start()


@socketio.on('moved')
def moved(data):
    game_data['board'] = data
    if game_data['turn'] == 'white':
        game_data['turn'] = 'black'
    else:
        game_data['turn'] = 'white'

    emit('updateboard', game_data['board'], broadcast=True)
    time_keeper.end_turn()

@socketio.on('gameover')
def gameover():
    time_keeper.started = False


def assign_player(color, username):
    if color == 'w' and game_data['wplayer'] == '':
        game_data['wplayer'] = username
    elif color == 'b' and game_data['bplayer'] == '':
        game_data['bplayer'] = username


if __name__ == '__main__':
    socketio.run(app, debug=True)
