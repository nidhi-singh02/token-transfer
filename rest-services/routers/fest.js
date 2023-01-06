const express = require('express')
const route = new express.Router()
const festCtrl = require('../controllers/festController')

route.post('/user', festCtrl.registerUser)
route.get('/bank/:ID', festCtrl.queryBank)

module.exports = route
