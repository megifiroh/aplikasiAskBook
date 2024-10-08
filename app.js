const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Book = require('./models/book_model')
const expressLayouts = require('express-ejs-layouts')
const auth = require('./auth')
const session = require('express-session');
const User = require('./models/user')


mongoose.connect('mongodb://127.0.0.1/book-app').then(()=>
    console.log('connection successful'));

const port = 3001;

app.listen(port, ()=>{
    console.log('express gass')
});

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))

app.use(auth.sessionConf)


app.get('/', auth.isAuth, async (req, res) => {
  const books = await Book.find();
  const authors = books.map(book => book.author);
  const genres = books.map(book => book.genre);

  const uniqueAuthors = [...new Set(authors)].sort();
  const uniqueGenres = [...new Set(genres)].sort();


  res.render('home_page', {
    title: 'Home Page',
    authors: uniqueAuthors,
    genres: uniqueGenres,
    layout: 'home_page'
  })
})

app.get('/books', auth.isAuth, async (req,res)=>{
    const { author, abstract, title, genre, sort, page = 1, limit = 10 } = req.query;

    let filters = {};
    if (title) {
        const regex = new RegExp(title, 'i');
            filters.$or = [
                { title: regex },
                { abstract: regex }
            ];
    }
    if (author) {
        filters.author = author;
    }

    if (genre) {
        filters.genre = genre;
    }

    let sortOption = {};
    if (sort) {
        sortOption = { rating: sort === 'highest' ? -1 : 1 };
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
    
    const totalBooks = await Book.countDocuments(filters);

    res.json({
        books,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: parseInt(page)
    });
})

app.get('/books/:_id', auth.isAuth, async (req,res)=>{
    const book = await Book.findOne({_id:req.params._id})

    res.render('details', {
        title: 'Details',
        layout: 'details',
        book: book
    })
});

app.get('/login', async (req,res)=>{
    res.render('login', {
        title: 'Login',
        layout: 'Login'
    })
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let errors = {};
    let oldInput = { username };

    // Check if the fields are empty
    if (!username) {
        errors.username = 'Username is required';
    }
    if (!password) {
        errors.password = 'Password is required';
    }

    // If there are any validation errors, re-render the form with the errors
    if (Object.keys(errors).length > 0) {
        return res.render('login', { title: 'Login', layout:'login', errors, oldInput });
    }

    // Find the user in the database
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
        errors.password = 'Invalid username or password';
        return res.render('login', { title: 'Login', layout:'login', errors, oldInput });
    }

    // Check if password matches
    if (password !== user.password) {
        errors.password = 'Invalid username or password';
        return res.render('login', { title: 'Login', layout:'login', errors, oldInput });
    }

    // If no errors, authenticate the user
    req.session.isAuth = true;
    req.session.userName = username;
    res.redirect('/');
});

app.post('/logout', auth.isAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('An error occurred while logging out.');
        }

        res.redirect('/login');
    });
});

// Register
app.get('/signup', async (req,res)=>{
    res.render('signup', {
        title: 'Sign Up',
        layout: 'signup',
        oldInput: {},
        errors: {}
    })
});

app.post('/signup', async (req,res)=>{
    const { firstName, lastName, email, username, password, confirm_password } = req.body;
    let errors = {};
    let oldInput = { firstName, lastName, email, username };

    // Check for required fields
    if (!firstName) errors.firstName = 'First Name is required';
    if (!lastName) errors.lastName = 'Last Name is required';
    if (!email) errors.email = 'Email is required';
    if (!username) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    if (!confirm_password) errors.confirm_password = 'Confirm Password is required';

    // Check if passwords match
    if (password && confirm_password && password !== confirm_password) {
        errors.confirm_password = 'Passwords do not match';
    }

    // If there are any validation errors, re-render the form with the errors
    if (Object.keys(errors).length > 0) {
        return res.render('signup', { title: 'Sign Up', layout:'signup', errors, oldInput });
    }

    try {
        // Save the user if no validation errors
        const register_user = new User({ firstName, lastName, email, username, password });
        await register_user.save();

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    
})


