const { clearHash } = require('../services/cache')


const cacheClearer = async (req, res, next) => {

    await next()

    clearHash(req.user.id)
}



module.exports = { cacheClearer }