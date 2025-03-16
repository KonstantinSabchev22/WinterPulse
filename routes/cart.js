const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { ensureAuthenticated } = require('../middleware/auth');

// Show Toast function for alerts


// Route to render the cart page
router.get('/', (req, res) => {
    console.log('I am here');
    res.render('cart/index');
});

// Route to handle checkout and save cart items to the database
router.post('/checkout',ensureAuthenticated, async (req, res) => {
    try {
        const { cartItems, name, country, address, paymentMethod } = req.body; // Updated data structure
        const userId = req.user.id;

        if (!name || !country || !address) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        console.log(cartItems, name, country, address, paymentMethod);

        // Create a new order
        const order = await Order.create({ 
            userId,
            deliveryAddress: address,
            customerName: name,
            customerCountry: country,
            paymentMethod // Stored for future logic
        });

        const orderItems = cartItems.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
        }));

        await OrderItem.bulkCreate(orderItems);

        res.status(200).json({ message: 'Order successfully created!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing order' });
    }
});

module.exports = router;
