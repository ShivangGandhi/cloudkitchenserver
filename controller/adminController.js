const dotenv = require('dotenv');
const secretsManager = require('../secrets/secretsManager.js');

const adminLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const params = {
        SecretId: process.env.SECRETSMANAGERID
    };

    const response = await secretsManager.getSecretValue(params).promise();
    const secrets = JSON.parse(response.SecretString)
    if (secrets.adminEmail !== email) {
        res.status(500).json({ message: "Email Incorrect" })
    }
    else {
        if (secrets.adminPassword !== password) {
            res.status(404).json({ message: "Password Incorrect" })
        }
        else {
            res.status(200).json({
                message: "Admin found",
                token: (new Date().getTime()).toString()
            })
        }
    }
}

module.exports = {
    adminLogin
}