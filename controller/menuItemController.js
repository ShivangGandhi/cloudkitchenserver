const dotenv = require('dotenv');
const crypto = require('crypto');
const awsS3 = require('../storage/awsS3.js');
const { bucketname, s3 } = awsS3;
const dynamoDB = require('../database/awsDynamo.js');
const secretsManager = require('../secrets/secretsManager.js');

var bucket
bucketname.then((response) => { bucket = response });

const getSecrets = async () => {
    const params = {
        SecretId: process.env.SECRETSMANAGERID
    };
    const response = await secretsManager.getSecretValue(params).promise();
    const secrets = JSON.parse(response.SecretString)
    return secrets
}

// const setBucketName = async () => {
//     const secrets = await getSecrets();
//     bucket = secrets.BUCKET;
// }

const getMenuItemsTable = async () => {
    const secrets = await getSecrets();
    return secrets.MENUITEMSTABLENAME;
}

const getS3CDNUrl = async () => {
    const secrets = await getSecrets();
    return secrets.S3CDNURL;
}

const uploadImage = (file) => {

    const base64FileData = new Buffer(file.data, 'binary')

    const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

    const fileName = randomImageName()

    const params = {
        Bucket: bucket,
        Key: fileName,
        Body: base64FileData,
        ACL: 'public-read'
    }

    const response = s3.upload(params, function (err, data) {
        if (err) {
            throw err
        }
    })

    return fileName
}

const deleteImage = async (imageName) => {

    const params = {
        Bucket: bucket,
        Key: imageName
    }
    await s3.deleteObject(params).promise();
}

const addMenuItem = async (req, res) => {

    const file = req.files
    const image = file[Object.keys(file)[0]]
    const imageName = uploadImage(image)

    var menuItem = req.body;
    menuItem = Object.assign(menuItem, { id: (new Date().getTime()).toString(), imageName: imageName })

    const params = {
        TableName: await getMenuItemsTable(),
        Item: menuItem
    }

    const response = await dynamoDB.put(params, function (err, data) {
        if (err) {
            res.status(404).json({ message: err.message })
        } else {
            console.log("Inserted menu item into Dynamodb!");
        }
    });
    const newMenuItem = response.rawParams.Item;
    res.status(200).json(newMenuItem);
}

const getMenuItems = async (req, res) => {

    const params = {
        TableName: await getMenuItemsTable()
    }

    const menuItems = await dynamoDB.scan(params, function (err, data) {
        if (err) {
            res.status(404).json({ message: err.message })
        }
    }).promise();

    for (const menuItem of menuItems.Items) {
        const imageURL = await getS3CDNUrl() + '' + menuItem.imageName;
        menuItem.imageURL = imageURL;
    }

    res.status(200).json(menuItems);
}

const deleteMenuItem = async (req, res) => {
    const id = req.params.id
    const params = {
        TableName: await getMenuItemsTable(),
        Key: {
            id
        },
        ReturnValues: 'ALL_OLD'
    }

    const response = await dynamoDB.delete(params, function (err, data) {
        if (err) {
            res.status(404).json({ message: err.message })
        } else {
            console.log("Deleted menu item into Dynamodb!");
        }
    }).promise();
    deleteImage(response.Attributes.imageName)
    res.status(200).json(response);
}

module.exports = {
    addMenuItem,
    getMenuItems,
    deleteMenuItem
}