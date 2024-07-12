const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

mongoose.connect('mongodb://localhost:27017/visitor', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const userSchema = new mongoose.Schema({
    user: String,
    age:Number
});
const User = mongoose.model('User', userSchema, 'pers');
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/add', (req, res) => {
    const user = new User(req.body);
    user.save()
        .then(() => res.send('User added'))
        .catch(err => res.send('Error adding user', err))
});
app.get('/view', (req, res) => {
    User.find()
        .then(users => {
            let table = '<table border="1">';
            table += '<tr><th>Username</th><th>Age</th></tr>';
            users.forEach(user => {
                table += `<tr><td>${user.user}</td><td>${user.age}</td></tr>`;
            });
            table += '</table>';
            res.send(`
                <html>
                <head><title>User List</title></head>
                <body>
                    <h1>User List</h1>
                    ${table}
                    <br>
                </body>
                </html>
            `);
        })
        .catch(err => {
            console.error('Error fetching users', err);
            res.send('Error fetching users');
        });
});

app.post('/del', (req, res) => {
    User.deleteOne({ user: req.body.user })
        .then(() => res.send('User deleted'))
        .catch(err => res.status(400).send('Error deleting user: ' + err));
});

app.post('/upd', (req, res) => {
    const { user, age } = req.body;
    User.updateOne({ user: user }, { $set: { age: age } })
        .then(result => { res.status(200).send(`Successfully updated user: ${user}`); })
        .catch(err => {res.status(500).send(`Error updating user: ${err}`);});
});

app.listen(3000, () => console.log('Server started on port 3000'));