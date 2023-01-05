const express = require('express')
const route = new express.Router()
const ticketCtrl = require('../controllers/ticketController')

route.post('/buyticket', ticketCtrl.buyTicket)
route.get('/ticketsByOwner/:userID', ticketCtrl.getTicketsByOwner)
route.get('/ticketsByOrganizer/:userID', ticketCtrl.getTicketsByOrganizer)
route.post('/approveticket', ticketCtrl.approveTicket)
route.post('/buyticketSecondary', ticketCtrl.buyticketSecondary)
route.post('/mintticket', ticketCtrl.mintTicket)
route.get('/tickets/secondarymarket', ticketCtrl.getTicketsinSecMarket)

module.exports = route
