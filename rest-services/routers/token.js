const express = require('express')
const route = new express.Router()
const tokenCtrl = require('../controllers/tokenController')

route.post('/getToken', tokenCtrl.getToken)
route.post('/getBalance', tokenCtrl.getBalance)

module.exports = route
