var express = require('express');
var router = express.Router();
const SnowBoard = require('../../models/SnowBoard');

const activePage = 'snowboards';

// Route to get all snowboards and display them in a table
router.get('/', async function (req, res, next) {
  try {
    // Fetch all snowboards from the database
    const allSnowboards = await SnowBoard.findAll();

    // Render the Pug template and pass the snowboards and activePage
    res.render('admin/snowboards', { 
      title: 'Snowboards', 
      activePage: activePage, 
      snowboards: allSnowboards, 
      currentUser: req.user 
    });
  } catch (error) {
    console.error(error);
    next(error); // Handle the error
  }
});

// GET: Render the Edit Snowboard form
router.get('/:id/edit', async function (req, res, next) {
  try {
    const snowboardId = req.params.id;

    // Find the snowboard by ID
    const snowboard = await SnowBoard.findByPk(snowboardId);
    if (!snowboard) {
      return res.status(404).send('Snowboard not found');
    }

    // Render the edit form and pass the snowboard data
    res.render('admin/editSnowboard', { title: 'Edit Snowboard', snowboard, activePage: activePage, currentUser: req.user });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST: Handle form submission to update the snowboard
router.post('/:id/edit', async function (req, res, next) {
  try {
    const snowboardId = req.params.id;
    const { name, model, length, material, price, imageUrl } = req.body;

    // Find the snowboard by ID
    const snowboard = await SnowBoard.findByPk(snowboardId);
    if (!snowboard) {
      return res.status(404).send('Snowboard not found');
    }

    // Update the snowboard with new values
    await snowboard.update({ name, model, length, material, price, imageUrl });

    // Redirect back to the snowboards list
    res.redirect('/admin/snowboards');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET: Render the Add Snowboard form
router.get('/new', async function (req, res, next) {
  try {
    // Render the form for adding a new snowboard
    res.render('admin/addSnowboard', { title: 'Add Snowboard', activePage: activePage, currentUser: req.user });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST: Handle form submission to create a new snowboard
router.post('/new', async function (req, res, next) {
  try {
    const { name, model, length, material, price, imageUrl } = req.body;

    // Create a new snowboard in the database
    await SnowBoard.create({ name, model, length, material, price, imageUrl });

    // Redirect back to the snowboards list
    res.redirect('/admin/snowboards');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;