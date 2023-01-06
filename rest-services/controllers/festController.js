const invoke = require('../sdk/invoke').invoke;
const config = require('../config');
const query = require('../sdk/query').query;


var registerUser = async function (req, res, next) {

    try {

        var userID = req.body.emailID
        var bankID = req.body.bankID
        console.log("userID :", userID)
        console.log("bankID :", bankID)

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ticketFestContract, "RegisterUser", {userID,bankID});
        let resp = JSON.stringify(response)
        console.log("response", response)
        if (resp.includes("Error")) {

            if (response.responses[0].response.message.includes("already exists")) {
                return res.status(200).json(response.responses[0].response.message)

            }
            return res.status(500).json(response.responses[0].response.message)

        }
        res.status(200).json("User Registered")


    } catch (error) {
        console.log("Error while registering user:", error)
        res.status(500).send({ "Error": error })

    }
}

var queryBank= async function (req, res, next) {
    try {

        let bankID = req.params.ID
        console.log("bankID:", bankID)
        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ticketFestContract, "QueryBankByID", bankID);
        if (response.hasOwnProperty("Error")) {
            return res.status(500).json(response)

        }
        res.status(200).json(response)

    } catch (error) {
        console.log("Error while query bank:", error)
        res.status(500).send({ "Error": error })

    }
}


module.exports = {
    registerUser: registerUser,
    queryBank: queryBank

}
