const express = require('express')
const route = new express.Router()
const tokenCtrl = require('../controllers/tokenController')

route.post('/getBalance', tokenCtrl.getBalance)
route.post('/minttoken', tokenCtrl.mintToken)
route.post('/transfertoken', tokenCtrl.transferToken)
route.post('/transfertokenfrom', tokenCtrl.transferTokenFrom)
route.post('/approvetoken', tokenCtrl.approveToken)
route.get('/tokenByOwner/:userID', tokenCtrl.tokenByOwner)

module.exports = route
