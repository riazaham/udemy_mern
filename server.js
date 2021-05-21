const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Connect database
connectDB();

app.get('/', (req, res) => res.send('API running'));

// Init Middleware
// Get data from req.body in users route
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

