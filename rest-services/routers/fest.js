const express = require('express')
const route = new express.Router()
const festCtrl = require('../controllers/festController')

route.post('/user', festCtrl.registerUser)
route.get('/festival/:ID', festCtrl.queryFestival)

module.exports = route
