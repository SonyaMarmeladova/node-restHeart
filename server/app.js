'use strict';

require('./config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const { log } = require('./utils/logger.utils');
const { 
	methodsHandler,
	clientErrorHandler,
	notFoundHandler 
} = require('./middlewares/http.middlewares');

const app = express();
app
	.use(bodyParser.json())
	.use(cors())
	.use(helmet())
	.use(methodsHandler)
	.use(require('./controllers/get.controllers'))
	.use(require('./controllers/post.controllers'))
	.use(require('./controllers/put.controllers'))
	.use(require('./controllers/patch.controllers'))
	.use(require('./controllers/delete.controllers'))
	.use(notFoundHandler)
	.use(clientErrorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
	const message = `Server is up. HTTP connections is listened on port ${port}`;
	log.info(message);
});

module.exports = {
	app
};
