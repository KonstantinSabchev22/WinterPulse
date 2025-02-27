var express = require('express');
var router = express.Router();
const Product = require('../../models/Product');
const {ensureAuthenticated, ensureRole} = require('../../middleware/auth');

const activePage = 'products';

// Route to get all products and display them in a table
router.get('/', ensureRole('admin'), async function (req, res, next) {
  try {
    // Fetch all products from the database
    const allProducts = await Product.findAll();

    // Render the Pug template and pass the products and activePage
    res.render('admin/products', { 
      title: 'Products', 
      activePage: activePage, 
      products: allProducts, 
      currentUser: req.user 
    });
  } catch (error) {
    console.error(error);
    next(error); // Handle the error
  }
});

// GET: Render the Edit Product form
router.get('/:id/edit', ensureRole('admin'), async function (req, res, next) {
  try {
    const productId = req.params.id;

    // Find the product by ID
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Render the edit form and pass the product data
    res.render('admin/editProduct', { title: 'Edit Product', product, activePage: activePage, currentUser: req.user });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST: Handle form submission to update the product
router.post('/:id/edit', ensureRole('admin'), async function (req, res, next) {
  try {
    const productId = req.params.id;
    const { name, model, length, material, price, imageUrl } = req.body;

    // Find the product by ID
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Update the product with new values
    await product.update({ name, model, length, material, price, imageUrl });

    // Redirect back to the products list
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET: Render the Add Product form
router.get('/new', ensureRole('admin'), async function (req, res, next) {
  try {
    // Render the form for adding a new Product
    res.render('admin/addProduct', { title: 'Add Product', activePage: activePage, currentUser: req.user });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST: Handle form submission to create a new product
router.post('/new', ensureRole('admin'), async function (req, res, next) {
  try {
    const { name, model, length, material, price, imageUrl } = req.body;

    // Create a new product in the database
    await Product.create({ name, model, length, material, price, imageUrl });

    // Redirect back to the products list
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;