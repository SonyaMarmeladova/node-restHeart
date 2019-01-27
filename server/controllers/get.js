'use strict';

const os = require('os');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

const { CommonSchema } = require('../models/common.js');
const { ClientErrors } = require('../utils/errors.js');
const { generateProperties } = require('../utils/property.js');
const { arrayToObject, parseFilter } = require('../utils/utils.js');
const { getDatabaseConnection } = require('../db/mongoose.js');

router.get(`/${process.env.APP_PREFIX}/info`, (req, res) => {
    parseFilter(req.query.filter);

    return res.status(200).send({
        statusCode: 200,
        arch: os.arch()
    });
});

router.get(`/${process.env.APP_PREFIX}/:database/:collection/:_id`, async(req, res, next) => {
    if (!req.params._id)
        return next('route');

    try {
        const _id = req.params._id;

        if (!ObjectId.isValid(_id))
            throw new Error(ClientErrors.INVALID_ID);

        const db = getDatabaseConnection(req.params.database);
        const collection = db.model(req.params.collection, CommonSchema);
        const document = await collection.findOne({ _id });

        if (!document)
            return res.status(404).send();

        return res.status(200).send(document);
    } catch(e) {
        return res.status(400).send({
            statusCode: 400,
            ERROR: e.message
        });
    }
});

router.get(`/${process.env.APP_PREFIX}/:database/:collection`, async(req, res) => {
    try {
        const filter = req.query.filter !== undefined 
            ? parseFilter(req.query.filter) : process.env.DEFAULT_FILTER;
        const sort = req.query.sort !== undefined 
            ? JSON.parse(_.replace(req.query.sort, new RegExp("\'","g"), "\"")) : process.env.DEFAULT_SORT;

        const pagesize = req.query.pagesize === undefined || +req.query.pagesize > +process.env.MAX_PAGESIZE 
            ? +process.env.DEFAULT_PAGESIZE : +req.query.pagesize;
        const page = req.query.page !== undefined 
            ? +req.query.page : +process.env.DEFAULT_PAGENUM; 
        
        const count = req.query.count === 'true';

        const keys = typeof req.query.keys === 'object' 
            ? arrayToObject(req.query.keys) : req.query.keys !== undefined ? JSON.parse(_.replace(req.query.keys, new RegExp("\'","g"), "\"")) : process.env.DEFAULT_KEYS;
        const hint = typeof req.query.hint === 'object' 
            ? req.query.hint.join(' ') : req.query.hint !== undefined ? JSON.parse(_.replace(req.query.hint, new RegExp("\'","g"), "\"")) : process.env.DEFAULT_HINT;

        const db = getDatabaseConnection(req.params.database);
        const collection = db.model(req.params.collection, CommonSchema);
        const documents = await collection.find(filter === '' ? {} : filter)
            .select(keys)
            .hint(hint)
            .skip(isNaN(page) ? +process.env.DEFAULT_PAGENUM : page * pagesize - pagesize)
            .limit(isNaN(pagesize) ? +process.env.DEFAULT_PAGESIZE : pagesize)
            .sort(sort);

        const response = req.query.np === '' ? documents 
            : generateProperties(documents, req.params.collection, await collection.countDocuments({}), pagesize, count);

        return res.send(response);
    } catch(e) {
        return res.status(400).send({
            statusCode: 400,
            ERROR: e.message
        });
    }
});

module.exports = router;
