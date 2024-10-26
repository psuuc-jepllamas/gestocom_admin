const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); // Import express-session

// Initialize Express app
const app = express();

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Firebase Admin with service account key
var serviceAccount = require(path.join(__dirname, 'public/services/db_private_key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://capstone-102-default-rtdb.firebaseio.com"
});

// Reference Firestore database
const db = admin.firestore();

// Login routes
const authRoutes = require('./routes/auth');
app.use(authRoutes);

// Home route
app.get('/', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.isAuthenticated) {
      return res.redirect('/login'); // Redirect to login if not authenticated
    }

    // Fetch all users from the 'Information' collection
    const usersSnapshot = await db.collection('Information').get();
    const moduleSnapshot = await db.collection('Categories').get();
    if (usersSnapshot.empty) {
      return res.status(404).send('No users found');
    }

    // Extract user data from each document
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const name = userData.Name;

      users.push({ id: doc.id, name: name });
    });

    const module = [];
    moduleSnapshot.forEach((doc) => {
      module.push({ module: doc.id });
    });

    // Render the index.ejs view and pass the users data
    res.render('index', { users, module });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error fetching user data');
  }
});

// Start the Express server
app.listen(3000, (err) => {
  if (err) {
    console.log('Error starting server:', err);
  } else {
    console.log('Server running on http://localhost:3000');
  }
});
