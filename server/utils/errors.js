'use strict';

const clientErrors = Object.freeze({
	INVALID_ID: 'Provided _id is not valid ObjectID field',
	INVALID_PAGESIZE: 'Provided pagesize param should be a number gte than 0',
	INVALID_PAGE: 'Provided page param should be a number gte than 0',
	INVALID_CREDENTIALS: 'Provided credentials are not valid',
	INVALID_JWT: 'Provided jwt token is not valid or have already expired'
});

const serverErrors = Object.freeze({
	INTERNAL_ERROR: 'Internal Server Error'
});

const errorResponse = (res, status, message) => {
	return res.status(status).send({
		statusCode: status,
		ERROR: message
	});
};

module.exports = {
	clientErrors,
	serverErrors,
	errorResponse
}; 
