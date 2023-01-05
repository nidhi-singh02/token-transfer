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

var mintToken = async function (req, res, next) {
    try {
        var { userID, amount } = req.body

      //  account string, amount int, txnID string,channel string

        console.log("userID :", userID)

        cts = Date.now().toString();
        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "MintToken", { userID: userID, amount: amount, cts : cts  });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {
            if (response.responses[0].response.message.includes("already minted")) {
                return res.status(203).json('Already minted. Select another ticketID')

            } else if (response.responses[0].response.message.includes("cannot create more than")) {
                return res.status(203).json(response.responses[0].response.message)
            }

            return res.status(500).json(response.responses[0].response.message)
        }
        //  res.status(200).send({ message: "Token Minted" })
        let ID = userID + cts;

        let response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"ID":"' + ID + '"}}');
        if (response_query.hasOwnProperty("Error")) {
            return res.status(500).send(response_query)

        }
        res.status(200).send(response_query)

    } catch (error) {
        console.log("Error while mint token:", error)
        res.status(500).send({ "Error": error })

    }
}

var transferToken = async function (req, res, next) {
    try {
        var { receiverID, amount } = req.body

      //  account string, amount int, txnID string,channel string

        console.log("receiverID :", receiverID)

        cts = Date.now().toString();
        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "TransferToken", { userID: receiverID, amount: amount });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {
            if (response.responses[0].response.message.includes("already minted")) {
                return res.status(203).json('Already minted. Select another ticketID')

            } else if (response.responses[0].response.message.includes("cannot create more than")) {
                return res.status(203).json(response.responses[0].response.message)
            }

            return res.status(500).json(response.responses[0].response.message)
        }
        //  res.status(200).send({ message: "Token Minted" })
        let ID = userID + cts;

        let response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"ID":"' + ID + '"}}');
        if (response_query.hasOwnProperty("Error")) {
            return res.status(500).send(response_query)

        }
        res.status(200).send(response_query)

    } catch (error) {
        console.log("Error while mint token:", error)
        res.status(500).send({ "Error": error })

    }
}


module.exports = {
    getToken: getToken,
    getBalance: getBalance,
    mintToken: mintToken,
    transferToken: transferToken
}