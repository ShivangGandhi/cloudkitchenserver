const express = require('express');
const controllers = require('../controller/menuItemController.js');
const { adminLogin } = require('../controller/adminController.js');
const { createOrder } = require('../controller/orderController.js');
const { addMenuItem, getMenuItems, deleteMenuItem } = controllers;

const router = express.Router();

router.post('/admin/login', adminLogin)
router.post('/addMenuItem', addMenuItem)
router.get('/getMenuItems', getMenuItems)
router.delete('/deletemenuitem/:id', deleteMenuItem)
router.post('/createOrder', createOrder)

module.exports = router;