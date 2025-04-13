var express = require('express');
var router = express.Router();
const {ensureAuthenticated, ensureRole} = require('../../middleware/auth');

const { Op } = require('sequelize');
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const Product = require('../../models/Product');
const User = require('../../models/User');

const activePage = 'orders';

// Fetch all orders with optional filters
router.get('/', ensureRole('admin'), async function (req, res, next) {
  const { status, startDate, endDate } = req.query;

  try {
    // Build filter conditions
    const filters = {};
    if (status) filters.status = status;
    if (startDate && endDate) filters.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };

    // Fetch orders and associated details
    const orders = await Order.findAll({
      where: filters,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user' },
      ],
    });

    // Render orders list
    res.render('admin/orders', { orders, filters: { status, startDate, endDate }, activePage, currentUser: req.user });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch details for a specific order
router.get('/:id', ensureRole('admin'), async function (req, res, next) {
  const { id } = req.params;

  try {
    // Fetch the order by ID with associated details
    const order = await Order.findOne({
      where: { id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user' },
      ],
    });

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Render detailed order view
    res.render('admin/orderDetail', { order, activePage, currentUser: req.user });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update the status of an order
router.patch('/:id', ensureRole('admin'), async function (req, res, next) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Ensure valid status is provided
    if (!['Чакаща', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find the order and update its status
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order ${id} updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
