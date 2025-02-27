//routes/cart.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// Route to render the cart page
router.get('/', (req, res) => {
    console.log('I am here');
  res.render('cart/index'); // This will render the cart view (cart/index.pug)
});

// Route to handle checkout and save cart items to the database
router.post('/checkout', async (req, res) => {
  try {
    const { cartItems, deliveryAddress } = req.body; // Include deliveryAddress from frontend
    const userId = req.user.id; // Assumes user is logged in and has an ID

    // Validate that deliveryAddress is provided
    if (!deliveryAddress || deliveryAddress.trim() === '') {
      return res.status(400).json({ message: 'Delivery address is required.' });
    }

    console.log(cartItems, deliveryAddress);

    // Create a new order
    const order = await Order.create({ 
      userId,
      deliveryAddress, // Save the delivery address in the Order model
    });

    // Save each item in the order
    const orderItems = cartItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItems); // Save all items to OrderItems table

    // Return success response
    res.status(200).json({ message: 'Order successfully created!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing order' });
  }
});

module.exports = router;
