var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const middleware = require('../middleware/auth');
const UserProduct = require('../models/UserProduct');

// Route to get all products, with optional filtering
router.get('/', async function(req, res, next) {
  try {
    const productFilter = req.query.productFilter;
    const page = parseInt(req.query.page) || 1; // Current page number
    const pageSize = 8; // Number of items per page

    let queryOptions = {
      offset: (page - 1) * pageSize,
      limit: pageSize
    };

    if (productFilter) {
      queryOptions.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${productFilter}%` } },
          { model: { [Op.like]: `%${productFilter}%` } },
          { material: { [Op.like]: `%${productFilter}%` } }
        ]
      };
    }

    const { rows: products, count: totalItems } = await Product.findAndCountAll(queryOptions);
    const totalPages = Math.ceil(totalItems / pageSize);

    res.render('products/index', { products, currentPage: page, totalPages, productFilter });
  } catch (error) {
    next(error);
  }
});


router.get('/new', middleware.ensureRole("admin"), function(req, res, next) {
  res.render('products/newProduct');
});

router.post('/new', middleware.ensureRole("admin"), async function(req, res, next) {
  const { name, model, length, material, price, imageUrl } = req.body;

  const data = {
      name,
      model,
      length,
      material,
      price,
      imageUrl // Add the imageUrl to the data
  };

  try {
    await Product.create(data);
    res.redirect('/products');
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send('Възникна грешка при добавяне на продукт');
  }
});


router.get('/:id/edit', middleware.ensureRole("admin"), async function(req, res, next) {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Product is not found!');
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
          return res.status(404).send('Product not found!');
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
      return res.status(404).send('Product not found');
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