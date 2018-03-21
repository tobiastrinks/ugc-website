/*-------- GLOBAL VAR --------*/
const allowOrigin = "https://beta.unigrow.de";
var clients = [];

var chatrooms = [];
var user = [];

var lastReport = 0;

/*-------- GLOBAL FCT --------*/
function filterObject(obj, attr, search){
    if(obj[attr] == search)
        return obj[attr];
}
function getClientIndex(user_key){
    for (var x = 0; x < clients.length; x++){
        if (clients[x].user_key == user_key) {
            return x;
        }
    }
    return false;
}
function getIndexByVal(array, val) {
    for (var x = 0; x < array.length; x++) {
        if (array[x] == val)
            return index;
    }
    return false;
}
function clientSendConn(connArray, response) {
    for (var x = 0; x < connArray.length; x++) {
        if (connArray[x])
            connArray[x].sendUTF(response);
    }
}

/*-----------RESPONSE--------------------*/
function livechatResponse(request, response, dest){
    if (response.length > 0 && dest.length > 0) {
        for (var x = 0; x < response.length; x++) {
            for (var y = 0; y < clients.length; y++) {
                for (var z = 0; z < dest[x].length; z++) {
                    if (clients[y].user_key == dest[x][z]) {
                        let response_send = response[x];
                        console.log(response_send);
                        // user specific data
                        if (request.type == 'msg') {
                            response_send.notifications = user[clients[y].user_key][response_send.chatroom_id];
                        }
                        //update notifications
                        if (request.type == 'msg' || request.type == 'report') {
                            if (clients[y].activeChatroom == request.chatroom_id) {
                                con.query('UPDATE user_chatrooms SET last_' + request.type + '=' + request.id + ' WHERE user_key="' + clients[y].user_key + '" AND chatroom_id=' + request.chatroom_id, function (error, result) {
                                });
                            }
                        }
                        clientSendConn(clients[y].conn, JSON.stringify(response_send));
                    }
                }
            }
        }
    }
}

/*----------DATABASE CONNECTION----------*/
const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user: "unigrow-course",
    password: "pRNtR_unicourse",
    database : "unigrow-course_livechat"
});

con.connect(function(err) {
    if (err) throw err;

    //--- load database val
    // get last report
    con.query('SELECT ID FROM chatroom_report ORDER BY ID DESC LIMIT 1', function(error, result) {
        if(error) throw error;

        lastReport = result[0].ID;
    });

    // get user_chatrooms
    con.query('SELECT user_key, chatroom_id, notifications FROM user_chatrooms', function (db_error, db_user, db_fields) {
        if(db_error) throw db_error;

        for(var x=0; x<db_user.length; x++){

            if(chatrooms[db_user[x].chatroom_id] === undefined)
                chatrooms[db_user[x].chatroom_id] = [];
            chatrooms[db_user[x].chatroom_id].push(db_user[x].user_key);

            if(user[db_user[x].user_key] === undefined)
                user[db_user[x].user_key] = [];
            user[db_user[x].user_key][db_user[x].chatroom_id] = db_user[x].notifications;
        }

        /*-------- INIT SOCKET SERVER -------*/
        // Optional. You will see this name in eg. 'ps' or 'top' command
        process.title = 'unigrow-livechat';
        // Port where we'll run the websocket server
        const webSocketsServerPort = 8443;
        // websocket and http servers
        const webSocketServer = require('websocket').server;
        const http = require('https');


        // HTTP SERVER
        const fs = require('fs');
        const express = require('express')
        const bodyParser = require('body-parser')

        var options = {
            key: fs.readFileSync('/etc/apache2/ssl-certificate/unigrow.de.key'),
            cert: fs.readFileSync('/etc/apache2/ssl-certificate/unigrow.de.pem'),
        };

        var app = express();

        var server = http.createServer(options, app).listen(webSocketsServerPort, function(){
            console.log("Express server listening on port " + webSocketsServerPort);
        })

        // Add headers
        app.use(function (req, res, next) {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'https://beta.unigrow.de');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);

            // Pass to next layer of middleware
            next();
        });

        app.use(bodyParser.json())

        app.post('/user/status', (request, response) => {
            var user_key = request.body;
            var result = {};
            for (var x = 0; x < user_key.length; x++) {
                result[user_key[x]] = false;
                for (var y = 0; y < clients.length; y++) {
                    if (user_key[x] == clients[y].user_key) {
                        result[user_key[x]] = 'online';
                    }
                }
                if (!result[user_key[x]]) {
                    result[user_key[x]] = 'offline';
                }
            }
            response.send(JSON.stringify(result));
        });
        app.post('/chatroom/user/status', (request, response) => {
            var chatroom_id = request.body.chatroom_id;
            var result = {};

            result.all = chatrooms[chatroom_id].length;

            result.online = 0;
            result.offline = 0;

            for (var x = 0; x < chatrooms[chatroom_id].length; x++) {
                var online = false;
                for (var y = 0; y < clients.length; y++) {
                    if (chatrooms[chatroom_id][x] == clients[y].user_key) {
                        result.online++;
                        online = true;
                    }
                }
                if (!online) {
                    result.offline++;
                }
            }

            response.send(JSON.stringify(result));
        });

        /**
         * WebSocket server
         */
        var wsServer = new webSocketServer({
            // WebSocket server is tied to a HTTP server. WebSocket
            // request is just an enhanced HTTP request. For more info
            // http://tools.ietf.org/html/rfc6455#page-6
            httpServer: server,
            ssl: true,
            port: webSocketsServerPort,
            ssl_cert: '/etc/apache2/ssl-certificate/unigrow.de.pem',
            ssl_key: '/etc/apache2/ssl-certificate/unigrow.de.key'
        });

        // This callback function is called every time someone
        // tries to connect to the WebSocket server
        wsServer.on('request', function(request) {
            console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

            // make sure only website users are able to connect
            if (request.origin == allowOrigin) {

                var connection = request.accept(null, request.origin);
                var connIndex = 0;
                var user_key = 0;
                var activityChatroom = 0;

                // user sent some message
                connection.on('message', function(message) {
                    if (message.type === 'utf8') { // accept only text
                        // first message sent by user is their name
                        var request = JSON.parse(message.utf8Data);
                        var response = [];
                        var dest = [];

                        if (request.type == "auth") {
                            // inform other clients
                            for (var x = 0; x < clients.length; x++) {
                                clientSendConn(clients[x].conn, JSON.stringify({
                                    type: 'status',
                                    user_key: request.user_key,
                                    status: 'online'
                                }));
                                clientSendConn(clients[x].conn, JSON.stringify({
                                    type: 'activity',
                                    user_key: request.user_key,
                                    activity: 0
                                }));
                            }
                            //add client element
                            var index = getClientIndex(request.user_key);
                            if (index) {
                                clients[index].conn.push(connection);
                                connIndex = clients[index].conn.length-1;
                            }
                            else {
                                clients.push({
                                    conn: [connection],
                                    user_key: request.user_key,
                                    activeChatroom: 0
                                });
                            }
                            user_key = request.user_key;
                        }

                        if (request.type == 'join'){
                            clients[getClientIndex(user_key)].activeChatroom = request.chatroom_id;
                        }
                        if (request.type == 'leave') {
                            clients[getClientIndex(user_key)].activeChatroom = 0;
                        }

                        if (request.type == 'activity'){
                            response[0] = {
                                type: 'activity',
                                user_key: user_key,
                                activity: request.activity,
                                chatroom_id: 0 // activityChatroom when typing
                            };
                            if(request.activity == 'typing') {
                                activityChatroom = clients[getClientIndex(user_key)].activeChatroom;
                                response[0].chatroom_id = activityChatroom;
                            }
                            dest[0] = chatrooms[activityChatroom];
                            livechatResponse(request, response, dest);
                        }
                        if (request.type == 'msg') {
                            response[0] = {
                                type: "msg",
                                id: request.id,
                                chatroom_id: request.chatroom_id,
                                content: request.content,
                                user_src_key: user_key,
                                timestamp: request.timestamp,
                                wrap_msg: request.wrap_msg
                            };
                            dest[0] = chatrooms[request.chatroom_id];
                            livechatResponse(request, response, dest);
                        }
                        if(request.type == 'report'){
                            con.query('SELECT ID, report, chatroom_id, user_key, user_key_action, timestamp FROM chatroom_report WHERE ID>' + lastReport + ' ORDER BY ID ASC', function(error, result){
                                if(error) throw error

                                for (var x = 0; x < result.length; x++) {
                                     response[x] = {
                                         type: "report",
                                         id: result[x].id,
                                         report: result[x].report,
                                         chatroom_id: result[x].chatroom_id,
                                         user_key: result[x].user_key,
                                         user_key_action: result[x].user_key_action,
                                         timestamp: result[x].timestamp
                                     };
                                     dest[x] = chatrooms[result[x].chatroom_id];
                                    lastReport = result[x].ID;

                                    var report = result[x].report;
                                    var user_key = result[x].user_key;
                                    var chatroom_id = result[x].chatroom_id;
                                    //join
                                    if (report == 'user_join' || report == 'user_add') {
                                        clients[getClientIndex(user_key)][chatroom_id] = 1;
                                        chatrooms[user_key].push(chatroom_id);
                                    }
                                    //leave
                                    if (report == 'user_leave' || report == 'user_remove') {
                                        clients[getClientIndex(user_key)].slice(getIndexByVal(clients[getClientIndex(user_key)], chatroom_id));
                                        delete chatrooms[user_key];
                                    }
                                }
                                livechatResponse(request, response, dest);
                             });
                        }
                    }
                });

                // user disconnected
                connection.on('close', function(connection) {
                    var index = getClientIndex(user_key);
                    clients[index].conn[connIndex] = false;
                    var disconnect = true;
                    for (var x = 0; x < clients[index].conn.length; x++) {
                        if (clients[index].conn[x]) {
                            disconnect = false;
                        }
                    }
                    if (disconnect) {
                        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
                        if (clients.length > 1)
                            clients.splice(getClientIndex(user_key), 1);
                        else
                            clients = [];
                        // inform other clients
                        for (var x = 0; x < clients.length; x++) {
                            clientSendConn(clients[x].conn, JSON.stringify({
                                type: 'status',
                                user_key: user_key,
                                status: 'offline'
                            }));
                        }
                    }
                });
            }
        });
    });
});