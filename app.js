//dependancies we need references to
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

//variables we will use later
const app = express();
const url = 'mongodb://localhost:27017'; //how to connect to locally hosted mongodb
const dbName = 'spark';
let db;

//connects to the locally hosted database
MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    if (err) return console.log(err)

    // Storing a reference to the database so you can use it later
    db = client.db(dbName);

    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);

    const prints = db.collection('prints'); //grab the 3d print collection

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //starts the app listening to the specified port number
    app.listen(3000, function () {
        console.log('listening on 3000');
    });

    //Displays the landing page for user requesting the base url
    app.get('/', (req, res) => {
        let reqPath = path.join(__dirname, '../FrontEnd/index.html'); //up one level find index.html
        res.sendFile(reqPath);
    });

    //handles posting to the specified url
    app.post('/quotes', (req, res) => {
        console.log(req.body);
        //insert the data from the form into the database collection
        prints.insertOne(req.body).then(result => {
            console.log(result);
        }).catch(error => console.log(error));
        res.redirect('back'); //sends user back to original submission page
    });
});