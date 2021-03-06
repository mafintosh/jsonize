var buffoon = require('buffoon');
var common = require('common');

module.exports = function(fn) {
	return function(request, response) {
		if (request.method === 'OPTIONS') {
			response.writeHead(200, {
				'access-control-allow-origin': '*',
				'access-control-allow-methods': 'PUT, POST, GET, OPTIONS',
				'access-control-allow-headers': 'Content-Type'					
			});
			response.end();
			return;
		}

		var respond = function(status, headers, body) {
			if (typeof status !== 'number' && !headers) {
				body = status;
				headers = {};
				status = 200;
			} else if (!body) {
				body = headers;
				headers = {};
			}

			body = JSON.stringify(body, null, '  ')+'\n';

			headers['content-type'] = headers['content-type'] || 'application/json';
			headers['content-length'] = Buffer.byteLength(body);
			headers['access-control-allow-origin'] = '*';

			response.writeHead(status, headers);
			response.end(body);
		};
		var onerror = function() {
			response.writeHead(500);
			response.end();
		};

		if (request.method === 'POST' || request.method === 'PUT') {
			buffoon.json(request, common.fork(onerror, function(json) {
				fn(request, json, respond);
			}));
			return;
		}
		fn(request, respond);
	};
};