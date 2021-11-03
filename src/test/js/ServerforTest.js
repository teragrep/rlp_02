/**
 *  In case need of simple local test server, run this first
 */
var net = require('net');
let msgrsp ='1 rsp 93 200 OK\nrelp_version=0\nrelp_software=librelp,1.2.14,http://librelp.adiscon.com\ncommands=syslog\n'; 
let msg2 =  '2 rsp 6 200 OK\n'; 
let msgopen = ''

console.log(msgrsp.length)
var server = net.createServer((socket) => {
	console.log('Connection from ', socket.remoteAddress, 'port', socket.remotePort);
	socket.end(msgrsp) // This is node callback arch loops by default. To make this use-once server we need to specifically end the connection.
	//socket.write(msgrsp);
	//socket.pipe(socket);
});

server.listen(1337, 'localhost');

/*
const server = net.createServer((socket) => {
	console.log('Connection from ', socket.remoteAddress, 'port', socket.remotePort);
    socket.on('data', (buffer) => {
        console.log('Request from ', socket.remoteAddress, 'port', socket.remotePort);
        socket.end(msgrsp);
    });
    socket.on('end', () => {
        console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
    });
});
server.maxConnections = 10;
server.listen(1337, 'localhost');
*/