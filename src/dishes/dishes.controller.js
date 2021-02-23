const { type } = require("os");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish ID '${dishId}' Doesn't Exist`
    });
}

function validDish(req, res, next) {
    const { data: { name, description, price, image_url } } = req.body;
    if (!name)
        return next({
            status: 400,
            message: `Dish must include a name`
        });

    if (name === "")
        return next({
            status: 400,
            message: `Dish must include a name`
        });

    if (!description)
        return next({
            status: 400,
            message: `Dish must include a description`
        });

    if (description === "")
        return next({
            status: 400,
            message: `Dish must include a description`
        });

    if (!price)
        return next({
            status: 400,
            message: `Dish must include a price`
        });

    if (price <= 0)
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });

    if (typeof price !== 'number')
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });

    if (!image_url)
        return next({
            status: 400,
            message: `Dish must include a image_url`
        });

    if (image_url === "")
        return next({
            status: 400,
            message: `Dish must include a image_url`
        });

    res.locals.dish = { data: { name, description, price, image_url } };
    return next();
}

function checkDishId(req, res, next) {
    const dishId = req.params.dishId;
    const id = req.body.data.id;
    if (dishId !== id && id !== undefined && id !== '' & id !== null) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        });
    }
    return next();
}

function read(req, res, next) {
    res.json({ data: res.locals.dish });
}

function create(req, res, next) {
    const { data: { name, description, price, image_url } } = res.locals.dish;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function update(req, res, next) {
    const dishId = req.params.dishId;
    const { data: { name, description, price, image_url } } = res.locals.dish;
    const updatedDish = {
        id: dishId,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }
    res.json({ data: updatedDish })
}

function list(req, res, next) {
    res.json({ data: dishes });
}

module.exports = {
    read: [dishExists, read],
    create: [validDish, create],
    update: [dishExists, checkDishId, validDish, update],
    list: [list],
}