const invoke = require('../sdk/invoke').invoke;
const query = require('../sdk/query').query;

const config = require('../config');

var buyTicket = async function (req, res, next) {
    try {
        var userID = req.body.emailID
        console.log("userID :", userID)

        let query_res = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "QueryTickets", '{"selector":{"owner":"wbp@wbp.org"}}');
        console.log("query_res", query_res[0])

        if (query_res[0] == undefined) {
            return res.status(202).json("Tickets not available for festival")

        }

        let ticketID = query_res[0].ticketID

        console.log("ticket", ticketID)
        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "TransferTicket", { userID: userID, ticketID: ticketID });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {

            if (response.responses[0].response.message.includes("Balance of new owner is lesser than the price for ticket")) {
                return res.status(203).json('Balance of user is lesser than the ticket price.Buy tokens to proceed')

            }
            return res.status(500).json(response.responses[0].response.message)
        }
        query_res[0].owner = userID
        res.status(200).send({ message: "Bought", data: query_res[0] })

    } catch (error) {
        console.log("Error while buying ticket:", error)
        res.status(500).send({ "Error": error })

    }
}

var getTicketsByOwner = async function (req, res, next) {
    try {

        let UserID = req.params.userID

        if (UserID == "" || UserID == 'null') {
            return res.status(501).send("User ID cannot be null")
        }
        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "QueryTickets", '{"selector":{"owner":"' + UserID + '"}}');
        if (response.hasOwnProperty("Error")) {
            return res.status(500).send(response)

        }
        res.status(200).send(response)

    } catch (error) {
        console.log("Error while getTicketsByOwner:", error)
        res.status(500).send({ "Error": error })

    }
}

var getTicketsByOrganizer = async function (req, res, next) {
    try {

        let UserID = req.params.userID

        if (UserID == "" || UserID == 'null') {
            return res.status(501).send("User ID cannot be null")
        }
        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "QueryTickets", '{"selector":{"organizer":"' + UserID + '"}}');
        if (response.hasOwnProperty("Error")) {
            return res.status(500).send(response)

        }
        res.status(200).send(response)

    } catch (error) {
        console.log("Error while getTicketsByOrganizer:", error)
        res.status(500).send({ "Error": error })

    }
}

var approveTicket = async function (req, res, next) {
    try {
        var { from, to, ticketID } = req.body
        console.log("from :", from)
        console.log("ticket", ticketID)

        if (ticketID == null || ticketID == "") {
            return res.status(202).json('ticket ID cannot be empty')
        }

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "ApproveTicket", { from: from, to: to, ticketID: ticketID });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {

            if (response.responses[0].response.message.includes("not correct owner nor authorized person")) {
                return res.status(203).json('Cannot approve sold tickets')

            } else if (response.responses[0].response.message.includes("Cannot get ticket")) {
                return res.status(203).json('Please enter valid ticket ID')

            }
            return res.status(500).json(response.responses[0].response.message)

        }
        res.status(200).json("Approved ticket from organizer in secondary market sales")

    } catch (error) {
        console.log("Error while approve Ticket:", error)
        res.status(500).send({ "Error": error })

    }
}

var buyticketSecondary = async function (req, res, next) {
    try {
        var { from, to, ticketID, price } = req.body
        console.log("from :", from)


        if (to == "" || to == 'null' || !to) {
            return res.status(203).json("Recipient cannot be empty")

        }

        if (ticketID == "" || ticketID == 'null' || !ticketID) {
            return res.status(203).json("Ticket ID cannot be empty")

        }

        if (price == "" || price == 'null' || !price) {
            return res.status(203).json("Price cannot be empty")

        }

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "TransferTicketFrom", { from: from, to: to, ticketID: ticketID, price: price });

        let resp = JSON.stringify(response)
        if (resp.includes("Error")) {
            if (response.responses[0].response.message.includes("110 percent greater")) {
                return res.status(203).json('Price is greater than 110 % of the current price')

            } else if (response.responses[0].response.message.includes("is lesser than the comission")) {
                return res.status(203).json('Secondary Market Admin cannot pay commission.Balance less')

            } else if (response.responses[0].response.message.includes("is invalid.It does not exist")) {
                return res.status(203).json('recipient is invalid')

            } else if (response.responses[0].response.message.includes("is lesser than the price")) {
                return res.status(203).json('recipient do not have enough balance')

            }
            return res.status(500).json(response.responses[0].response.message)

        }

        let query_res = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "QueryTickets", '{"selector":{"ticketID":"' + ticketID + '"}}');
        if (query_res == "") {
            return res.status(203).json("No ticket found")

        }
        console.log("query_res", query_res[0])
        res.status(200).json(query_res[0])

    } catch (error) {
        console.log("Error while buying ticket Secondary Market:", error)
        res.status(500).send({ "Error": error })

    }
}

var mintTicket = async function (req, res, next) {
    try {
        var { userID, festivalID, ticketID } = req.body

        console.log("userID :", userID)

        let response = await invoke(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "MintTicket", { userID: userID, festivalID: festivalID, ticketID: ticketID });

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
        let finalTicketID = ticketID + festivalID

        let response_query = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "QueryTickets", '{"selector":{"ticketID":"' + finalTicketID + '"}}');
        if (response_query.hasOwnProperty("Error")) {
            return res.status(500).send(response_query)

        }
        res.status(200).send(response_query)

    } catch (error) {
        console.log("Error while mint ticket:", error)
        res.status(500).send({ "Error": error })

    }
}

var getTicketsinSecMarket = async function (req, res, next) {
    try {

        let response = await query(config.FabricConfig.channelID, config.FabricConfig.chaincodeID, config.FabricConfig.nftContract, "QueryTickets", '{"selector":{"approved":"secondary@wbp.org"}}');
        if (response.hasOwnProperty("Error")) {
            return res.status(500).send(response)

        }
        res.status(200).send(response)

    } catch (error) {
        console.log("Error while getTicketsinSecMarket:", error)
        res.status(500).send({ "Error": error })

    }
}


module.exports = {
    buyTicket: buyTicket,
    getTicketsByOwner: getTicketsByOwner,
    approveTicket: approveTicket,
    buyticketSecondary: buyticketSecondary,
    getTicketsByOrganizer: getTicketsByOrganizer,
    mintTicket: mintTicket,
    getTicketsinSecMarket: getTicketsinSecMarket

}

