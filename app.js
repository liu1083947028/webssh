/**
* Created by Frank 2019/11/25
* WebSSH 程序
**/
exports.__esModule = true;
var config = require('./config').config;
var express = require("express");
// var pty = require("pty.js");
var app = express();
var port = config.port || 4028;

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var expressWs = require('express-ws')(app);
// Serve static assets from ./static
app.use(express.static(__dirname + "/static"));
var Client = require('ssh2').Client

process.on('uncaughtException', function (err) {
    console.error('Error caught in uncaughtException event:', err);
});

global.sshConn = {};
// Instantiate shell and set up data handlers
expressWs.app.ws('/shell', function (ws, req) {
    console.log("==req==",req.query);
    var reqId = req.query.id;
    global.sshConn[reqId] || (global.sshConn[reqId] = new Client());
    global.sshConn[reqId].shell(function(err, stream) {
        if (err) throw err;
        ws.on('message', function (msg) {
            //console.log("ws msg=", msg)
            msg = JSON.parse(msg);
            if(msg.data){
                try{
                    stream.write(msg.data);                    
                }catch(e){
                    console.error("stream.write error", e);
                    ws.close();
                }
                global.sshConn[reqId].wsShell || (global.sshConn[reqId].wsShell = '');
                if(msg.data == '\r'){
                    console.log("global.sshConn[reqId].wsShell =",global.sshConn[reqId].wsShell);
                    if(global.sshConn[reqId].wsShell == 'exit'){
                        //退出控制台
                        ws.close();
                        global.sshConn[reqId].end();
                        global.sshConn[reqId] = null;
                    }else{
                        global.sshConn[reqId].wsShell = '';
                    }
                }else{
                    global.sshConn[reqId].wsShell += msg.data;    
                }
            }else if(msg.resize){
                stream.setWindow(msg.resize.rows, msg.resize.cols)
            }
           
        });
        ws.on('close', function(){
            console.log("客户端断开连接");
            global.sshConn[reqId] && global.sshConn[reqId].end();
            global.sshConn[reqId] = null;
        })

        stream.on('data', function (data) { 
            var sshData = data.toString('utf-8');
            console.log('====ssh data=====', sshData);
            ws.send(data);    
        });
    });
});

app.post('/connect', upload.single('privateKey'), function (req, res, next) {
    var data = req.body || {};
    console.log("connect==", data, req.query, req.params);    
    var clientId = req.query.clientId || new Date().getTime();
    if(global.sshConn[clientId]){
        return res.send({
            status: 'connect success',
            id: clientId
        });
    }
    global.sshConn[clientId] = new Client();
    //开始登录ssh
    global.sshConn[clientId].on('ready', function() {
        console.log('Client :: ready 连接成功');        
        res.send({
            status: 'connect success',
            id: clientId
        });
    }).on('error', function(err) {
        console.log("connct ===", err);
        global.sshConn[clientId] = null;
        res.send({
            status: 'connect fail',
            statusText: err.message
        });
    }).connect({
      host: data.hostname,
      port: data.port || 22,
      username: data.username,
      password: data.password
      // privateKey: require('fs').readFileSync('/here/is/my/key')
    });
});
// Start the application
app.listen(port);

console.log("listen port:", port);
