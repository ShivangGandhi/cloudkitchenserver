const dotenv = require('dotenv');
const aws = require('aws-sdk');
const secretsManager = require('../secrets/secretsManager.js');

dotenv.config();

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.SESSION_TOKEN,
    region: process.env.REGION
})

const getSecrets = async () => {
    const params = {
        SecretId: process.env.SECRETSMANAGERID
    };
    const response = await secretsManager.getSecretValue(params).promise();
    const secrets = JSON.parse(response.SecretString)
    return secrets
}

const getBucketName = async () => {
    const secrets = await getSecrets();
    return secrets.BUCKET
}

const bucketname = getBucketName();
const s3 = new aws.S3();

module.exports = {
    bucketname,
    s3
}