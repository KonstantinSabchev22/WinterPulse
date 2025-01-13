var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const SnowBoard = require('../models/SnowBoard');
const middleware = require('../middleware/auth');
const UserSnowboards = require('../models/UserSnowboard');
const UserSnowboard = require('../models/UserSnowboard');

// Route to get all snowboards, with optional filtering
router.get('/', async function(req, res, next) {
  try {
    // Check for snowboardFilter query parameter
    const snowboardFilter = req.query.snowboardFilter;

    let queryOptions = {};

    if (snowboardFilter) {
      queryOptions = {
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${snowboardFilter}%` } },
            { model: { [Op.like]: `%${snowboardFilter}%` } },
            { material: { [Op.like]: `%${snowboardFilter}%` } }
          ]
        }
      };
    }

    // Query all snowboards from the database
    const allSnowboards = await SnowBoard.findAll(queryOptions);
    console.log(allSnowboards);
    // Render the index.jade template and pass the snowboards as a variable
    res.render('snowboards/index', { snowboards: allSnowboards });
  } catch (error) {
    // Handle errors
    console.log(error);
    next(error);
  }
});

router.get('/new', middleware.ensureRole("admin"), function(req, res, next) {
  res.render('snowboards/newSnowboards');
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
    await SnowBoard.create(data);
    res.redirect('/snowboards');
  } catch (error) {
    console.error('Error creating snowboard:', error);
    res.status(500).send('Възникна грешка при добавяне на сноуборд');
  }
});


router.get('/:id/edit', middleware.ensureRole("admin"), async function(req, res, next) {
  try {
    const snowboardId = req.params.id;
    const snowboard = await SnowBoard.findByPk(snowboardId);
    if (!snowboard) {
      return res.status(404).send('Snowboard is not found!');
    }
    res.render('snowboards/editSnowboard', { snowboard: snowboard });
  } catch (error) {
    next(error);
  }
});


router.post('/:id/edit', middleware.ensureRole("admin"), async function(req, res, next) {
  try {
      const snowboardId = req.params.id;
      const { name, model, material, length, imageUrl, price } = req.body;

      const snowboard = await SnowBoard.findByPk(snowboardId);
      if (!snowboard) {
          return res.status(404).send('Snowboard not found!');
      }

      await snowboard.update({
          name,
          model,
          material,
          length,
          imageUrl,
          price
      });

      res.redirect(`/snowboards/${snowboardId}`);
  } catch (error) {
      next(error);
  }
});

router.delete('/:id/remove-favorite', middleware.ensureAuthenticated, async function(req, res, next) {
  const data = {
    userId: req.user.id,
    snowboardId: req.params.id,
  };

  try {
    const existingFavorite = await UserSnowboard.findOne({ where: data });
    if (existingFavorite) {
      // If yes, remove it
      await existingFavorite.destroy();
      return res.status(200).send("Snowboard is removed from favorites!");
    } else {
      return res.status(400).send("Snowboard not in favorites for current user!");
    }
  } catch(error) {
    // Handle errors
    console.error(error);
    return res.status(500).send("An error occurred while processing your request!");
  }
});

router.get('/:id/add-favorite', middleware.ensureAuthenticated, async function(req, res, next){
  const data = {
    userId: req.user.id,
    snowboardId: req.params.id,
  };
  
  try {
    // Check if the snowboard is already added as a favorite
    const existingFavorite = await UserSnowboard.findOne({ where: data });
  
    if (existingFavorite) {
      // If yes, remove it
      await existingFavorite.destroy();
      return res.status(200).send("Snowboard is removed from favorites!");
    } else {
      // If not, add it
      await UserSnowboards.create(data);
      return res.status(200).send("Snowboard is added to favorites!");
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).send("An error occurred while processing your request!");
  }
  
});

router.get('/favorites', middleware.ensureAuthenticated, async function (req, res, next) {
  try {
    // Find all UserSnowboard records for the logged-in user
    const favoriteSnowboards = await UserSnowboard.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: SnowBoard,
          as: 'snowboard',
        },
      ],
    });

    // Extract snowboards
    const snowboards = favoriteSnowboards.map(fav => fav.snowboard);

    res.render('snowboards/favorites', { snowboards });
  } catch (error) {
    console.error('Error fetching favorite snowboards:', error);
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const snowboardid = req.params.id;
    const snowboard = await SnowBoard.findByPk(snowboardid);
    if (!snowboard) {
      return res.status(404).send('Snowboard not found');
    }
    let isFavorite = false;
    console.log(req.user);
    if (req.user){
      isFavorite = await UserSnowboard.findOne({
        where: {
          userId: req.user.id,
          snowboardId: snowboardid,
        }
      });
      console.log(isFavorite);
    }

    res.render('snowboards/snowBoardsDetails', { snowboard: snowboard, isFavorite: !!isFavorite});
  }catch (error) {
    console.log(error);
    next(error);
  }

});

module.exports = router;
