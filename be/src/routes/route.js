const express = require('express');
const { getHomePage } = require('../controllers/homeController')
const router = express.Router()


const initWebRoutes = (app) => {
    router.get('/', getHomePage)
    return app.use('/', router)
}

module.exports  = initWebRoutes