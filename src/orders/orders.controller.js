const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// add handlers and middleware functions 
// to create, read, update, delete, and list orders.

function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order ID '${orderId}' Doesn't Exist`
    });
}

function validOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } } = req.body;

    if (!deliverTo) {
        return next({
            status: 400,
            message: `Order must include a deliverTo`
        });
    }
    if (deliverTo === '') {
        return next({
            status: 400,
            message: `Order must include a deliverTo`
        });
    }

    if (!mobileNumber) {
        return next({
            status: 400,
            message: `Order must include a mobileNumber`
        });
    }
    if (mobileNumber === '') {
        return next({
            status: 400,
            message: `Order must include a mobileNumber`
        });
    }

    if (!dishes) {
        return next({
            status: 400,
            message: `Order must include a dish`
        });
    }

    if (!Array.isArray(dishes)) {
        return next({
            status: 400,
            message: `Order must include at least one dish`
        });
    }

    if (dishes.length === 0) {
        return next({
            status: 400,
            message: `Order must include at least one dish`
        });
    }

    for (let dish of dishes) {
        if (!dish.quantity)
            return next({
                status: 400,
                message: `Dish ${dishes.indexOf(dish)} must have a quantity that is an integer greater than 0`
            });
        if (dish.quantity <= 0)
            return next({
                status: 400,
                message: `Dish ${dishes.indexOf(dish)} must have a quantity that is an integer greater than 0`
            });
        if (!Number.isInteger(dish.quantity))
            return next({
                status: 400,
                message: `Dish ${dishes.indexOf(dish)} must have a quantity that is an integer greater than 0`
            });
    }

    res.locals.order = { data: { deliverTo, mobileNumber, dishes } };
    return next();
}

function validStatus(req, res, next) {
    const { data: { status } } = req.body;

    if (!status)
        return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        });

    if (status === '')
        return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        });

    if (status === 'delivered')
        return next({
            status: 400,
            message: `A delivered order cannot be changed`
        });
    if (status === 'invalid')
        return next({
            status: 400,
            message: `Order status is invalid`
        });
    return next();
}

function checkOrderId(req, res, next) {
    const orderId = req.params.orderId;
    const id = req.body.data.id;
    if (orderId !== id && id !== undefined && id !== '' & id !== null) {
        return next({
            status: 400,
            message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`
        });
    }
    return next();
}

function validDeleteStatus(req, res, next) {
    const status = res.locals.order.status;

    if (status !== 'pending')
        return next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`
        });

    return next();
}

function read(req, res, next) {
    res.json({ data: res.locals.order });
}

function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } } = res.locals.order;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        dishes: dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
    const orderId = req.params.orderId;
    const { data: { deliverTo, mobileNumber, dishes, status } } = req.body;
    const updatedOrder = {
        id: orderId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    }
    res.json({ data: updatedOrder })
}

function list(req, res, next) {
    res.json({ data: orders });
}

function destroy(req, res, next) {
    const orderId = req.params.orderId;
    const index = orders.findIndex((order) => order.id === orderId);
    if (index > -1) {
        orders.splice(index, 1);
    }
    res.sendStatus(204);
}

module.exports = {
    read: [orderExists, read],
    create: [validOrder, create],
    update: [orderExists, validOrder, validStatus, checkOrderId, update],
    list: [list],
    delete: [orderExists, validDeleteStatus, destroy]
}