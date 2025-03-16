const { sequelize } = require('../../models');
var express = require('express');
var router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../../middleware/auth');
const { Op } = require('sequelize');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');

const activePage = 'home';

router.get('/', ensureRole('admin'), async function (req, res, next) {
    try {
        // Statistics Data
        const totalUsers = await User.count();
        const totalProducts = await Product.count();
        const totalOrders = await Order.count();
        const deliveredOrders = await Order.count({ where: { status: 'Completed' } });

        // Chart Data (Orders per Month)
        const ordersByMonth = await Order.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
            ],
            group: ['month'],
            raw: true
        });

        // Recent Orders
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user' }]
        });

        res.render('admin/index', {
            activePage,
            currentUser: req.user,
            stats: { totalUsers, totalProducts, totalOrders, deliveredOrders },
            ordersByMonth,
            recentOrders
        });
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        res.status(500).render('admin/index', {
            error: 'An error occurred while loading dashboard data.' + error,
            activePage,
            currentUser: req.user
        });
    }
});

module.exports = router;
