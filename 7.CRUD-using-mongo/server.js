const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios=require("axios");
const app = express();

mongoose.connect('mongodb://localhost:27017/visitor', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const userSchema = new mongoose.Schema({
    _id: Number,
    username: String,
    phone: Number,
    aadhar: String,
    intime: Date,
    outtime: Date,
    password: String
});

const User = mongoose.model('User', userSchema, "all");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/',async (req,res)=>{
    res.sendFile(__dirname,'index.html');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        else{
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
            res.sendFile(__dirname,"main.html");
        } else {
            console.log('Login failed: User not found');
            res.send('Login failed: User not found');
        }
    } catch (err) {
        console.error('Error finding user:', err);
        res.status(500).send('Login failed');
    }
});

// const  User = mongoose.model('User', homeSchema, "persons");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
});

app.post('/addVisitor', async (req, res) => {
    const { idc,username,phone,aadhar, intime, outtime } = req.body;
    console.log(idc);
    try {
        const user = await User.create({ _id:idc,username:username,phone:phone,aadhar:aadhar, intime:intime, outtime:outtime });
        // i+=1;
        console.log('User created:', user);
        res.send("Account has been made!");
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send(`New User Creation failed ${err}`);
    }
});



app.get('/viewVisitor', async (req, res) => {
    try {
        const events = await User.find();
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Events Table</title>
                <style>
                p{
                    font-size : 20px;
                    position:fixed;
                    margin-top:-10vh;
                    background-color:#fff;
                    width:100%;
                }
                    table {
                        margin-top:10vh;
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                    tr:hover {
                        background-color: #ddd;
                    }
                    .action-buttons {
                        text-align: center;
                    }
                </style>
            </head>
            <body>
            <p>All Visitors:</p>
                <table>
                    <thead>
                        <tr id='hed'>
                            <th>Room Number</th>
                            <th>User Name</th>
                            <th>Contact Number</th>
                            <th>Aadhar Number</th>
                            <th>In-Time</th>
                            <th>Out-Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => `
                            <tr>
                                <td>${event._id}</td>
                                <td>${event.username}</td>
                                <td>${event.phone}</td>
                                <td>${event.aadhar}</td>
                                <td>${event.intime}</td>
                                <td>${event.outtime}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error${error}`);
    }
});


app.post('/updateVisitor', async (req, res) => {
    const { idc,username,phone,aadhar, intime, outtime } = req.body;
    try {
        const user = await User.findOne({ _id:idc }).exec();
        if (user) {
            user.username=username 
            user.phone=phone 
            user.aadhar=aadhar 
            user.intime=intime
            user.outtime=outtime
            await user.save();
            console.log("User updated successfully");
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            console.log("Incorrect email or password");
            res.status(401).json({ message: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});


app.post('/delete', async (req, res) => {
    const { idc } = req.body;
    try {
        const deletedUser = await User.deleteOne( {_id:idc} );
        console.log(idc);

        if (User.findOne({_id:idc})) {
            res.status(200).send(`User ${idc} deleted successfully`);
        } else {
            res.status(404).send(`User not found ${deletedUser}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/deleteVisitor', async (req, res) => {
    const { idc } = req.body;
    try {
        const user = await User.findOne({ _id:idc }).exec();
        if (user) {
            // Delete user
            await User.deleteOne({ idc });
            console.log("User deleted successfully");
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            console.log("Incorrect email or password");
            res.status(401).json({ message: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
