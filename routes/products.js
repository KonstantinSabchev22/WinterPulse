var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const middleware = require('../middleware/auth');
const UserProduct = require('../models/UserProduct');

// Route to get all products, with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const productFilter = req.query.productFilter; // Extract productFilter from query params
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    // Filter conditions
    const whereCondition = {};
    if (category) whereCondition.category = category;
    if (productFilter) {
      whereCondition.name = { [Op.like]: `%${productFilter}%` }; // Add search logic
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.render('products/index', {
      products,
      category,
      productFilter,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.get('/search-suggestions', async (req, res) => {
  const { term } = req.query; // Extract search term
  if (!term) {
    return res.json([]);
  }

  try {
    const suggestions = await Product.findAll({
      where: {
        name: { [Op.like]: `%${term}%` } // Partial match for autocomplete
      },
      attributes: ['name'], // Only return product names
      limit: 10 // Limit results to improve performance
    });

    // Send an array of product names as JSON
    res.json(suggestions.map(product => product.name));
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


router.get('/:id/edit', middleware.ensureRole("admin"), async function(req, res, next) {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Продуктът не е намерен!');
    }
    res.render('products/editProduct', { product: product });
  } catch (error) {
    next(error);
  }
});


router.post('/:id/edit', middleware.ensureRole("admin"), async function(req, res, next) {
  try {
      const productId = req.params.id;
      const { name, model, material, length, imageUrl, price } = req.body;

      const product = await Product.findByPk(productId);
      if (!product) {
          return res.status(404).send('Продуктът не е намерен!');
      }

      await product.update({
          name,
          model,
          material,
          length,
          imageUrl,
          price
      });

      res.redirect(`/product/${productId}`);
  } catch (error) {
      next(error);
  }
});

router.delete('/:id/remove-favorite', middleware.ensureAuthenticated, async function (req, res, next) {
  const data = {
    userId: req.user.id,
    productId: req.params.id,
  };

  try {
    const existingFavorite = await UserProduct.findOne({ where: data });
    if (existingFavorite) {
      await existingFavorite.destroy();
      return res.status(200).json({ message: "Продуктът беше премахнат от любими!" });
    } else {
      return res.status(400).json({ message: "Продуктът не е в любими за текущия потребител!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Възникна грешка при обработване на заявката!" });
  }
});

router.get('/:id/add-favorite', middleware.ensureAuthenticated, async function(req, res, next) {
  const data = {
      userId: req.user.id,
      productId: req.params.id,
  };

  try {
      const existingFavorite = await UserProduct.findOne({ where: data });

      if (existingFavorite) {
          await existingFavorite.destroy();
          return res.status(200).send("removed"); // Consistent response
      } else {
          await UserProduct.create(data);
          return res.status(200).send("added"); // Consistent response
      }
  } catch (error) {
      console.error(error);
      return res.status(500).send("error");
  }
});





router.get('/favorites', middleware.ensureAuthenticated, async function (req, res, next) {
  try {
    // Find all UserProducts records for the logged-in user
    const favoriteProducts = await UserProduct.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    // Extract products
    const products = favoriteProducts.map(fav => fav.product);

    res.render('products/favorites', { products });
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Продуктът не е намерен!');
    }
    let isFavorite = false;
    console.log(req.user);
    if (req.user){
      isFavorite = await UserProduct.findOne({
        where: {
          userId: req.user.id,
          productId: productId,
        }
      });
      console.log(isFavorite);
    }

    res.render('products/productDetails', { product: product, isFavorite: !!isFavorite});
  }catch (error) {
    console.log(error);
    next(error);
  }

});

module.exports = router;