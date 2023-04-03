const dotenv = require('dotenv');
const dynamoDB = require('../database/awsDynamo.js');

const secretsManager = require('../secrets/secretsManager.js');

const getSecrets = async () => {
    const params = {
        SecretId: process.env.SECRETSMANAGERID
    };
    const response = await secretsManager.getSecretValue(params).promise();
    const secrets = JSON.parse(response.SecretString)
    return secrets
}

const getOrdersTable = async () => {
    const secrets = await getSecrets();
    return secrets.ORDERSTABLE;
}

const createOrder = async (req, res) => {
    var order = req.body;
    order = Object.assign(order, { id: (new Date().getTime()).toString() })

    const params = {
        TableName: await getOrdersTable(),
        Item: order
    }

    const response = await dynamoDB.put(params, function (err, data) {
        if (err) {
            res.status(404).json({ message: err.message })
        } else {
            console.log("Inserted order into Dynamodb!");
        }
    });

    const createdOrder = response.rawParams.Item;
    res.status(200).json(createdOrder);

}

module.exports = {
    createOrder
}