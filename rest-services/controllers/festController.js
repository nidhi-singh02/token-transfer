const invoke = require('../sdk/invoke').invoke;
const config = require('../config');
const query = require('../sdk/query').query;


var registerUser = async function (req, res, next) {

    try {

        var userID = req.body.emailID
        console.log("userID :", userID)

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ticketFestContract, "RegisterUser", userID);
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

var queryFestival = async function (req, res, next) {
    try {

        let festivalID = req.params.ID
        console.log("festivalID:", festivalID)
        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.ticketFestContract, "QueryFestivalByID", festivalID);
        if (response.hasOwnProperty("Error")) {
            return res.status(500).json(response)

        }
        res.status(200).json(response)

    } catch (error) {
        console.log("Error while queryFestival:", error)
        res.status(500).send({ "Error": error })

    }
}


module.exports = {
    registerUser: registerUser,
    queryFestival: queryFestival

}
