const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const User = require('./models/user'); // Your Mongoose schema


const app = express();
const PORT = 3000;

// ✅ MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/ecommerceDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


// ✅ Sample product data
const productList = require('./views/product.ejs');

// ✅ Routes

// Home page
app.get('/', (req, res) => {
  res.render('index', { products: productList, user: req.session.user });
});

// About page
app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user });
});

// Product page
app.get('/product', (req, res) => {
  res.render('product', { products: productList, user: req.session.user });
});

// Register form
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Login form
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Register logic
app.post('/register', async (req, res) => {
  try {
    const {
      title, firstName, lastName,
      email, password, phone,
      house, postcode
    } = req.body;

    // Password validation: 6-12 chars, must include letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).render('register', { error: 'Password must be 6–12 characters and include letters and numbers.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).render('register', { error: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      title, firstName, lastName,
      email, password: hashedPassword,
      phone, house, postcode
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).render('register', { error: 'Server error: ' + err.message });
  }
});


// Login logic
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).render('login', { error: 'Invalid email or password.' });
    }

    req.session.user = user.email;
    res.redirect('/');
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).render('login', { error: 'Server error: ' + err.message });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
