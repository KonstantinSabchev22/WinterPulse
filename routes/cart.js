const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { ensureAuthenticated } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/emailUtils');

router.get('/', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.render('cart/index', { user });
});

router.post('/checkout', ensureAuthenticated, async (req, res) => {
    try {
        const { cartItems, name, country, address, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!name || !country || !address) {
            return res.status(400).json({ message: 'Всички задължителни полета трябва да бъдат попълнени.' });
        }

        // Create a new order
        const order = await Order.create({ 
            userId,
            deliveryAddress: address,
            customerName: name,
            customerCountry: country,
            paymentMethod
        });

        // Fetch product details
        const productIds = cartItems.map(item => item.productId);
        const products = await Product.findAll({
            where: { id: productIds },
            attributes: ['id', 'name']
        });

        // Map order items with product names
        const orderItems = cartItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: product ? product.name : 'Unknown Product',
            };
        });

        await OrderItem.bulkCreate(orderItems);

        // Prepare order details for email
        const orderDetails = {
            orderId: order.id,
            customerName: name,
            customerCountry: country,
            deliveryAddress: address,
            paymentMethod,
            items: orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        console.log(orderDetails);

        // Send confirmation email
        await sendOrderConfirmationEmail(req.user.email, req.user.firstName, orderDetails);

        res.status(200).json({ message: 'Поръчката е успешно направена' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing order' });
    }
});

module.exports = router;
