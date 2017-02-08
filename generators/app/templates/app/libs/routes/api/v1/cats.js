'use strict';

const models = require("models"),
    HTTPStatus = require('http-status'),
    objectValidator = require('utils/object-validator'),
    <% if (locals.useSequelize) {%>
    sequelize = require('utils/sequelize'),
    <%}%>
    _ = require('lodash');

/**
 * GET /api/v1/cats
 * @param req req
 * @param res res
 */

async function list(req, res) {
    <% if (locals.useMongo) {%>
    res.json({
        cats: await models.Cat.find({})
    });
    <%}%>
    <% if (locals.useSequelize) {%>
    let cats = await sequelize.transaction(async t => {
                // chain all your queries here. make sure you return them.
                return await models.Cat.findAll({transaction: t});
            }
        );
    res.json({
        cats: cats
    });
    <%}%>
}

/**
 * GET /api/v1/cats/:id
 * @param req req
 * @param res res
 */

async function get(req, res) {
    <% if (locals.useMongo) {%>
    res.json({
        cat: await models.Cat.findById(req.params.id)
    });
    <%}%>
    <% if (locals.useSequelize) {%>
    let cat = await sequelize.transaction(async t => {
                // chain all your queries here. make sure you return them.
                return await models.Cat.find({
                    where: {
                        id : req.params.id
                    },
                    transaction: t
                });
            }
        );
    res.json({
        cat: cat
    });
    <%}%>
}

/**
 * POST /api/v1/cats
 * @param req req
 * @param res res
 */

async function create(req, res) {
    //@f:off
    objectValidator.createValidator(req.body)
        .field('name')
            .isLength('Name must be from 1 to 255 symbols.', {min: 1, max: 255})
        .validate();
    //@f:on
    <% if (locals.useMongo) {%>
    let newCat = await models.Cat.create(req.body);
    <%}%>
    <% if (locals.useSequelize) {%>
    let newCat = await sequelize.transaction(async t => {
            // chain all your queries here. make sure you return them.
            return await models.Cat.create(req.body, {transaction: t});
        }
    );
    <%}%>
    res.json({
        id: newCat.id
    });
}

/**
 * PUT /api/v1/cats/:id
 * @param req req
 * @param res res
 */

async function update(req, res) {
    //@f:off
    objectValidator.createValidator(req.body)
        .field('name')
            .isLength('Name must be from 1 to 255 symbols.', {min: 1, max: 255})
        .validate();
    //@f:on
    <% if (locals.useMongo) {%>
    let cat = await models.Cat.findById(req.params.id);
    <%}%>
    <% if (locals.useSequelize) {%>
    let cat = await sequelize.transaction(async t => {
                // chain all your queries here. make sure you return them.
                return await models.Cat.find({
                    where: {
                        id : req.params.id
                    },
                    transaction: t
                });
            }
        );
    <%}%>

    _.assign(cat, req.body);

    <% if (locals.useMongo) {%>
    await cat.save();
    <%}%>
    <% if (locals.useSequelize) {%>
    await sequelize.transaction(async t => {
            // chain all your queries here. make sure you return them.
            await cat.save({transaction: t});
        }
    );
    <%}%>
    res.status(HTTPStatus.NO_CONTENT).send();
}

/**
 * DELETE /api/v1/cats/:id
 * @param req req
 * @param res res
 */

async function remove(req, res) {
    <% if (locals.useMongo) {%>
    await models.Cat.findByIdAndRemove(req.params.id);
    <%}%>
    <% if (locals.useSequelize) {%>
    await sequelize.transaction(async t => {
            // chain all your queries here. make sure you return them.
            await models.Cat.destroy({
                where: {
                    id: req.params.id
                },
                transaction: t
            });
        }
    );
    <%}%>

    res.status(HTTPStatus.NO_CONTENT).send();
}

module.exports = {
    list: list,
    get: get,
    create: create,
    update: update,
    remove: remove
};