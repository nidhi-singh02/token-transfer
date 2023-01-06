const invoke = require('../sdk/invoke').invoke;
const config = require('../config');
const query = require('../sdk/query').query;


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
        console.log("amount :", amount)

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "MintToken", { userID: userID, amount: amount });

        let resp = JSON.stringify(response)
        console.log("resp",resp)
        if (resp.includes("Error")) {
            if (response.responses[0].response.message.includes("already minted")) {
                return res.status(203).json('Already minted. Select another ticketID')

            } else if (response.responses[0].response.message.includes("cannot create more than")) {
                return res.status(203).json(response.responses[0].response.message)
            }

            return res.status(500).json(response.responses[0].response.message)
        }
        //  res.status(200).send({ message: "Token Minted" })

        let response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"UserID":"' + userID + '"}}');
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
        console.log("receiverID :", receiverID)

        if (amount == "" || amount == 'null') {
            return res.status(203).send("Amount cannot be null")
        }

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "TransferToken", { receiverID: receiverID, amount: amount });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {
            return res.status(500).json(response.responses[0].response.message)
        }
      
         response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"UserID":"' + receiverID + '"}}');
        if (response_query.hasOwnProperty("Error")) {
            return res.status(500).send(response_query)
        }
        res.status(200).send(response_query)

    } catch (error) {
        console.log("Error while transferring token:", error)
        res.status(500).send({ "Error": error })
    }
}

var transferTokenFrom = async function (req, res, next) {
    try {
        var { senderID, receiverID, amount } = req.body
        console.log("senderID receiverID :", senderID,receiverID)

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "TransferTokenFrom", { senderID: senderID,userID: receiverID, amount: amount });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {
            return res.status(500).json(response.responses[0].response.message)
        }
      
         response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"userID":"' + receiverID + '", "userName": { "$exists": false}}}');
        if (response_query.hasOwnProperty("Error")) {
            return res.status(500).send(response_query)
        }
        res.status(200).send(response_query)

    } catch (error) {
        console.log("Error while transferring token:", error)
        res.status(500).send({ "Error": error })
    }
}

var approveToken = async function (req, res, next) {
    try {
        var { senderID, receiverID, amount } = req.body
        console.log("senderID receiverID :", senderID,receiverID)

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "ApproveToken", { receiverID: receiverID, amount: amount,senderID: senderID });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {
            return res.status(500).json(response.responses[0].response.message)
        }
      
         response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"UserID":"' + receiverID + '"}}');
        if (response_query.hasOwnProperty("Error")) {
            return res.status(500).send(response_query)
        }
        res.status(200).send(response_query)

    } catch (error) {
        console.log("Error while transferring token:", error)
        res.status(500).send({ "Error": error })
    }
}

var tokenByOwner = async function (req, res, next) {
    try {

        let UserID = req.params.userID

        if (UserID == "" || UserID == 'null') {
            return res.status(501).send("User ID cannot be null")
        }
        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ftContract, "QueryTokens", '{"selector":{"userID":"' + UserID + '", "userName": { "$exists": false}}}}');
        if (response.hasOwnProperty("Error")) {
            return res.status(500).send(response)

        }
        res.status(200).send(response)

    } catch (error) {
        console.log("Error while tokenByOwner:", error)
        res.status(500).send({ "Error": error })

    }
}


module.exports = {
    getBalance: getBalance,
    mintToken: mintToken,
    transferToken: transferToken,
    transferTokenFrom: transferTokenFrom,
    approveToken: approveToken,
    tokenByOwner: tokenByOwner
}