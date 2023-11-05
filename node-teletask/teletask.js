var net = require('net');

var request = require('./lib/request');
var functions = require('./lib/functions');
var settings = require('./lib/settings');
var Report = require('./lib/report');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

exports.functions = functions;
exports.settings = settings;

var connect = function(host, port, callback){

	EventEmitter.call(this);
	var self = this;

	var keepaliveInterval;

	socket = new net.Socket();
	socket.connect(port, host, function(){
		console.log('starting up new connection');
		if(typeof callback === 'function'){	callback(); }
		keepaliveInterval = setInterval(self.keepalive, 1000 * 20); // send keep alive every 20 seconds, at least every 1 min a message is needed to keep connection alive
	});


	socket.on('data', function(data){
		while(data.length !== 0){
			if(data[0] == 10){  // Acknowledge
				data = data.slice(1);
				self.emit("acknowledge");
				// clear acknowledge timeout
			} else {
				try{
					var report = Report.parse(data);
					self.emit("report", report);
					data = data.slice(report.size+1);
				} catch (err) {
					console.log("Parsing error: " + err);
					data = data.slice(1);
				}
			}
		}
	});

	// always crash on close
	socket.on('close', function(err){ 
		console.log('closing')
		console.log(err)
		process.exit(1);
		
	});

	// always crash on error
	socket.on('error', function(err){
		console.log('error')
		console.log(err)
		process.exit(1);
	});

	// should all these functions be set by prototype?????

	this.write = function(data, callback){
		socket.write(data.toBinary(), callback);
	};

	this.set = function(fnc,number, setting, data){
	    var request = new Set(fnc, number,setting);
		console.log('request is', request)
	    this.write(request);
		};


	this.get = function(fnc, number, callback){
		var request = new Get(fnc, number);
		this.write(request, function(){
			var reportCallback = function(report){
				if (typeof callback === "function" &&
						number == report.number &&
						fnc == functions[report.fnc]
						) {
					callback(report);
					self.removeListener("report", reportCallback);
				}
			}
			self.on("report", reportCallback);
		});
	};

	this.groupget = function(fnc, numbers){
		var request = new GroupGet(fnc, numbers);
	    this.write(request);
	};

	this.log = function(fnc, status){
		var state = (typeof status === 'undefined' || status === true) ? settings.on : settings.off;
		var request = new Log(fnc, state);
	    this.write(request);
	};

	this.keepalive = function(){
		var request = new KeepAlive();
	    self.write(request);
	};

	this.close = function(){
		socket.end();
		clearInterval(keepaliveInterval);
	};
};

util.inherits(connect, EventEmitter);

exports.connect = connect;
