'use strict';

const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { CommonSchema } = require('../models/common.models');
const { UserSchema } = require('../models/users.model');
const { getCollection } = require('../db/mongoose.db');
const { bulk_counter_max, bulk_response } = require('../constants/mongoose.constants');
const { clientErrors } = require('../constants/errors.constants');
const { verifyJWT } = require('../utils/jwt.utils');

const addUser = async (req, res, next) => {
	try {
		const Users = await getCollection(req.params.database, 'Users', UserSchema);
		const user = new Users({
			email: req.body.email,
			password: req.body.password
		});
		const createdAt = Number(new Date());
		const tokens = await user.generateTokens(createdAt, createdAt);

		return res
			.status(200)
			.cookie('r_token', tokens.refreshToken, { maxAge: 9000000000, httpOnly: true, secure: true })
			.send({
				tokens
			});
	} catch (err) {
		return next(err);
	}
};

const refreshTokens = async (req, res, next) => {
	try {
		const refreshToken = req.cookies.r_token;
		const Users = await getCollection(req.params.database, 'Users', UserSchema);
		const user = await Users.findByToken(refreshToken, 'tokens.refreshToken');

		if (user.error) {
			user.tokens = user.tokens.filter(tokens => tokens.refreshToken !== refreshToken);
			await user.save();
	
			throw new Error(clientErrors.TOKEN_EXPIRED);
		}

		const index = user.tokens.findIndex(tokens => tokens.refreshToken === refreshToken);
		const createdAt = user.tokens[index].createdAt;
		const updatedAt = Number(new Date());
		user.tokens = user.tokens.filter((token, i) => i !== index);
		await user.save();

		const tokens = await user.generateTokens(createdAt, updatedAt);

		return res
			.status(200)
			.cookie('r_token', tokens.refreshToken, { maxAge: 9000000000, httpOnly: true, secure: true })
			.send({
				tokens
			});
	} catch (err) {
		return next(err);
	}
};

const authenticateUser = async (req, res, next) => {
	try {
		const User = await getCollection(req.params.database, 'Users', UserSchema);  
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const createdAt = Number(new Date());
		const tokens = await user.generateTokens(createdAt, createdAt);
    
		return res
			.status(200)
			.cookie('r_token', tokens.refreshToken, { maxAge: 9000000000, httpOnly: true, secure: true })
			.send({
				tokens
			});
	} catch (err) {
		return next(err);
	}
};

const addDocuments = async (req, res, next) => {
	try {
		const collection = await getCollection(req.params.database, req.params.collection, CommonSchema);

		let bulk = collection.collection.initializeOrderedBulkOp();
		let counter = 0;

		req.body.forEach(doc => {
			const { _id } = doc;
			const data = _.omit(doc, ['_id']);

			if (_id) {
				bulk.find({ _id: new ObjectID(_id) }).replaceOne(data);
			} else {
				bulk.insert(data);
			}

			counter++;
			if (counter % bulk_counter_max === 0) {
				bulk.execute((err, r) => {
					if (err) {
						throw new Error(err);
					}
      
					bulk = collection.collection.initializeOrderedBulkOp();
					counter = 0;
				});
			}
		});
    
		bulk.execute((err, result) => {
			if (err) {
				throw new Error(err);
			}

			const response = { ...bulk_response };
			response._embedded = result.getInsertedIds();
			response.inserted = result.nInserted;
			response.matched = result.nMatched;
			response.modified = result.nModified;
			response.deleted = result.nRemoved;

			return res.status(200).send(response);
		});
	} catch (err) {
		return next(err);
	}
};

module.exports = {
	addUser,
	authenticateUser,
	addDocuments,
	refreshTokens
};
