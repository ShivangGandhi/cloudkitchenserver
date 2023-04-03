const dotenv = require('dotenv');
const aws = require('aws-sdk');

dotenv.config();

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.SESSION_TOKEN,
    region: process.env.REGION
})

const dynamoDB = new aws.DynamoDB.DocumentClient();

module.exports = dynamoDB;

