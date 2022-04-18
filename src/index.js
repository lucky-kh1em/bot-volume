const mongoose = require('mongoose');
const config = require('./config');
const orderedTrade = require('./services');

let server;

mongoose
	.connect(config.mongodbUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('mongodb connected');
		orderedTrade();
	});

const unexpectedErrorHandler = (error) => {
	console.error(error);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
