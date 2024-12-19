const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Route to get the current user profile
router.get('/', async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      res.render('admin/userProfile', { user, activePage: 'profile', currentUser: req.user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Render the edit user form
router.get('/edit', async (req, res) => {
  try {
    // Replace this with the current logged-in user logic (e.g., req.user.id)
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('admin/editUser', { user, activePage: 'profile', currentUser: req.user });
  } catch (error) {
    console.error('Error fetching user for edit:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle user profile updates
router.post('/edit', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { firstName, lastName, email } = req.body;

    if (!userId) {
      return res.redirect('/login');
    }

    const user = await User.findByPk(userId);
    console.log("helooo")

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    await user.save();

    res.redirect('/admin/profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

  module.exports = router;