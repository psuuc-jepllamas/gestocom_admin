// routes/auth.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Firestore reference
const db = admin.firestore();

// GET request for login page
router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

// POST request to handle login
router.post('/login', async (req, res) => {
    const { uname, pass } = req.body;

    try {
        const adminSnapshot = await db.collection('admin').where('uname', '==', uname).get();

        if (adminSnapshot.empty) {
            return res.render('login', { errorMessage: 'Invalid username or password' });
        }

        const adminData = adminSnapshot.docs[0].data();
        if (adminData.pass === pass) {
            // Set session variable to indicate the user is authenticated
            req.session.isAuthenticated = true;
            return res.redirect('/'); // Redirect to the homepage on success
        } else {
            res.render('login', { errorMessage: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error during login');
    }
});

// Homepage route
router.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        // Render the homepage if authenticated
        res.render('homepage'); // Assuming you have a homepage.ejs file
    } else {
        // Redirect to login if not authenticated
        res.redirect('/login');
    }
});

// Logout route (optional)
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); // Redirect on error
        }
        res.redirect('/login'); // Redirect to login on success
    });
});

module.exports = router;
