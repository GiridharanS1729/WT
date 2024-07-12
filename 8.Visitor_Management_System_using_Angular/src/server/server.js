const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require("axios");
const app = express();

mongoose.connect('mongodb://localhost:27017/visitor', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema, "logsigin");

app.use(bodyParser.urlencoded({ extended: true }));


app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        else {
            const user = await User.create({ username, password });
            console.log('User created:', user);
            res.send("Account has been made!");
        }
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Signup failed');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            console.log('Login successful:', user);
            res.sendFile(__dirname, "main.html");
        } else {
            console.log('Login failed: User not found');
            res.send('Login failed: User not found');
        }
    } catch (err) {
        console.error('Error finding user:', err);
        res.status(500).send('Login failed');
    }
});



// main page code


const homeSchema = new mongoose.Schema({
    _id: Number,
    username: String,
    phone: Number,
    aadhar: String,
    intime: Date,
    outtime: Date
});

const Home = mongoose.model('Home', homeSchema, "persons");

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/add', async (req, res) => {
    const { idc, username, phone, aadhar, intime, outtime } = req.body;
    console.log(idc);
    try {
        const user = await Home.create({ _id: idc, username: username, phone: phone, aadhar: aadhar, intime: intime, outtime: outtime });
        // i+=1;
        console.log('User created:', user);
        res.send("Account has been made!");
        res.end();
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send(`New User Creation failed ${err}`);
    }
});



app.get('/view', async (req, res) => {
    try {
        const perPage = 8;
        const page = parseInt(req.query.page) || 1;
        const startLetters = req.query.start || '';

        const searchQuery = startLetters
            ? { username: { $regex: `^${startLetters}`, $options: 'i' } }
            : {};


        const totalRecords = await Home.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalRecords / perPage);

        const events = await Home.find(searchQuery)
            .skip((page - 1) * perPage)
            .limit(perPage);

        const formatDate = (dateString) => {
            const dateObject = new Date(dateString);
            const formattedDate = dateObject.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            });
            const formattedTime = dateObject.toLocaleTimeString('en-US', {
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
            });
            return `${formattedDate} [${formattedTime}]`;
        };

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Events Table</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                p {
                    font-size: 24px;
                    margin: 0;
                    padding: 20px;
                    background-color: #343a40;
                    color: white;
                    text-align: center;
                }
                .search-container {
                    text-align: right;
                    margin: 20px 10%;
                }
                .search-container input[type="text"] {
                    padding: 10px;
                    font-size: 17px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                table {
                    margin: 20px auto;
                    width: 90%;
                    border-collapse: collapse;
                    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
                    background-color: white;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background-color: #6c757d;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:hover {
                    background-color: #ddd;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    margin: 20px 0;
                }
                .pagination a {
                    color: #343a40;
                    padding: 8px 16px;
                    text-decoration: none;
                    border: 1px solid #ddd;
                    margin: 0 2px;
                }
                .pagination a.active {
                    background-color: #343a40;
                    color: white;
                    border: 1px solid #343a40;
                }
                .pagination a:hover:not(.active) {
                    background-color: #ddd;
                }
                </style>
            </head>
            <body>
                <p>All Visitors</p>
                <div class="search-container">
                    <input type="text" id="searchInput" name="search" placeholder="Search by Name" value="${startLetters}">
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Room Number</th>
                            <th>Name</th>
                            <th>Contact Number</th>
                            <th>Aadhar Number</th>
                            <th>In Time</th>
                            <th>Out Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => `
                            <tr>
                                <td>${event._id}</td>
                                <td>${event.username}</td>
                                <td>${event.phone}</td>
                                <td>${event.aadhar}</td>
                                <td>${formatDate(event.intime)}</td>
                                <td>${formatDate(event.outtime)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="pagination">
                    ${Array.from({ length: totalPages }, (_, i) => `
                        <a href="/view?page=${i + 1}&start=${startLetters}" class="${page === i + 1 ? 'active' : ''}">${i + 1}</a>
                    `).join('')}
                </div>
                <script>
                    const searchInput = document.getElementById('searchInput');
                    let timer;
                    searchInput.addEventListener('input', function() {
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            const startLetters = searchInput.value.trim();
                            const url = '/view?start=' + startLetters;
                            window.location.href = url;
                        }, 500);
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error: ${error}`);
    }
});





app.post('/update', async (req, res) => {
    const { idc, username, phone, aadhar, intime, outtime } = req.body;
    try {
        const user = await Home.findOne({ _id: idc }).exec();
        if (user) {
            Object.assign(user, {
                username: username || user.username,
                phone: phone || user.phone,
                aadhar: aadhar || user.aadhar,
                intime: intime || user.intime,
                outtime: outtime || user.outtime
            });
            await user.save();
            console.log("User updated successfully");
            return res.status(200).json({ message: 'User updated successfully' });
        } else {
            console.log("User not found");
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: 'An error occurred' });
    }
});



app.post('/delete', async (req, res) => {
    const { idc } = req.body;
    try {
        const deletedUser = await Home.deleteOne({ _id: idc });
        console.log(idc);

        if (Home.findOne({ _id: idc })) {
            res.status(200).send(`User ${idc} deleted successfully`);
        } else {
            res.status(404).send(`User not found ${deletedUser}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});


const PORT = 4201;
app.listen(PORT, () => {
    console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
