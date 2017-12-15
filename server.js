const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let users = [];

const port = 3000;

function User(name, score, level) {
    this.name = name;
    this.score = score;
    this.level = level;
}

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static path
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connect
io.sockets.on('connection', (socket) => {
    // Set Username
    socket.on('set user', (data, callback) => {
        console.log('setting');
        if(users.indexOf(data) != -1){
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            //users.push(socket.username);
            users.push(new User(socket.username,0,1));
            updateUsers();
        }
    });
    
    socket.on('send message',function (data) {
        io.sockets.emit('show message',{msg: data, user: socket.username});
    });

    socket.on('send score',function (data) {
        let theLog;
        for(let i =0 ;i <users.length; i++){
            if(users[i].name == data.id){
                theLog = i;
            }
        }
        users[theLog].score += data.score;
        if(users[theLog].score >5 && users[theLog].score < 10){
            users[theLog].level = 2;
        } else if(users[theLog].score >10 && users[theLog].score < 20){
            users[theLog].level = 3;
        }else if(users[theLog].score >20 && users[theLog].score < 40){
            users[theLog].level = 4;
        }
        console.log(users[theLog].level);
        updateUsers();
    });


    /*socket.on('disconnect', function(data){
        console.log(data);
        console.log(socket.username);
        if(!socket.username) return;
        users.splice(users.indexOf(socket.username), 1);
        updateUsers();
    });*/

    function updateUsers(){
        users.sort(function (a,b) {
           return parseFloat(b.score) - parseFloat(a.score);
        });
        io.sockets.emit('users', users);
    }

});

app.get('/', (req, res, next)=> {
    res.render('index');
});

server.listen(port, () => {
    console.log('Server started on port '+port);
});