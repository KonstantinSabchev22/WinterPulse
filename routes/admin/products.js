var express = require('express');
var router = express.Router();
const Product = require('../../models/Product');
const {ensureAuthenticated, ensureRole} = require('../../middleware/auth');

const activePage = 'products';

router.get("/add-product", ensureRole("admin"), async (req, res, next) => {
  try {
      res.render("admin/addproduct", {
          title: "Add Product",
          currentUser: req.user,
      });
  } catch (error) {
      console.error(error);
      next(error);
  }
});

// POST: Handle form submission to create a new product
router.post("/add-product", ensureRole("admin"), async (req, res, next) => {
  try {
      const { category, name, model, length, material, size, price, imageUrl } = req.body;

      // Ensure `length` is only included for the correct categories
      const productData = {
          category,
          name,
          model,
          price,
          imageUrl,
          length: (category === "snowboard" || category === "ski") ? length || null : null, 
          material: (category === "snowboard" || category === "ski") ? material || null : null,
          size: (category === "shoes" || category === "hats") ? size || null : null,
      };

      console.log("Product Data Before Save:", productData); 

      await Product.create(productData);
      res.redirect("/admin/products");
  } catch (error) {
      console.error("Error creating product:", error);
      next(error);
  }
});


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
router.get('/edit-product/:id', ensureRole('admin'), async (req, res) => {
  try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
          return res.status(404).send('Product not found');
      }
      res.render('admin/editproduct', { product, categories: ['snowboard', 'ski', 'shoes', 'hats'] });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error loading product for editing');
  }
});

router.post('/edit-product/:id', ensureRole('admin'), async (req, res) => {
  try {
      const { name, model, price, length, material, size, imageUrl, category } = req.body;
      const product = await Product.findByPk(req.params.id);

      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Update fields based on category
      product.name = name;
      product.model = model;
      product.price = price;
      product.imageUrl = imageUrl;
      product.category = category;

      if (category === 'snowboard' || category === 'ski') {
          product.length = length;
          product.material = material;
          product.size = null; // Reset size for non-size products
      } else if (category === 'shoes' || category === 'hats') {
          product.size = size;
          product.length = null; // Reset length for non-length products
          product.material = null; // Reset material for non-material products
      }

      await product.save();
      res.redirect('/admin/products');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating product');
  }
});

// GET: Render the delete product confirmation page
router.get('/delete-product/:id', ensureRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    // Render the confirmation page before deletion
    res.render('admin/deleteproduct', { product });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading product for deletion');
  }
});

// POST: Handle product deletion
router.post('/delete-product/:id', ensureRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Delete the product from the database
    await product.destroy();
    res.redirect('/admin/products'); // Redirect to the product list page
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting product');
  }
});




module.exports = router;