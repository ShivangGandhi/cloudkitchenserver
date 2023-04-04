const express = require('express');
const dotenv = require('dotenv');
const router = require('./routes/routes.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const port = 8080;

const app = express();
dotenv.config()

app.use(fileUpload());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/', router);

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});