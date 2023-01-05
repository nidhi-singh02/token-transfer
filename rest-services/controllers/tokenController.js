const invoke = require('../sdk/invoke').invoke;
const config = require('../config');
const query = require('../sdk/query').query;

var getToken = async function (req, res, next) {
    try {
        var { userID, amount } = req.body

        console.log("userID :", userID)

        if (amount == "" || amount == 'null') {
            return res.status(203).send("Amount cannot be null")
        }

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "TransferToken", { userID: userID, amount: amount });

        let resp = JSON.stringify(response)

        if (resp.includes("Error")) {
            if (response.responses[0].response.message.includes("ExchangeOperator account exchange101@gmail.com has no balance")) {
                return res.status(203).json('Exchange Operator has no token')

            }
            return res.status(500).json(response.responses[0].response.message)
        }

        res.status(200).json("Token Received")

    } catch (error) {
        console.log("Error while getting token:", error)
        res.status(500).send({ "Error": error })

    }
}
var getBalance = async function (req, res, next) {
    try {
        var userID = req.body.emailID
        console.log("userID :", userID)

        if (userID == "" || userID == null) {
            return res.status(501).send("User ID cannot be null")
        }

        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "BalanceOfToken", userID);

        if (response.hasOwnProperty("Error")) {
            return res.status(500).json(response)

        }
        res.status(200).json(response)


    } catch (error) {
        console.log("Error while getting Balance:", error)
        res.status(500).send({ "Error": error })

    }
}


module.exports = {
    getToken: getToken,
    getBalance: getBalance
}