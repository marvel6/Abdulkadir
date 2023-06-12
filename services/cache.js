const redis = require('redis')
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
const util = require('util')
const mongoose = require('mongoose')

client.hget = util.promisify(client.hget)



const exec = mongoose.Query.prototype.exec;


mongoose.Query.prototype.cache = function (options = {}) {

    this.isCache = true
    this.haskedKey = JSON.stringify(options.key || '')

    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.isCache) {

        return exec.apply(this, arguments)
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))

    const cachedValue = await client.hget(this.haskedKey, key)

    if (cachedValue) {

        const doc = JSON.parse(cachedValue)


        console.log('from cache')

        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)


    }



    const val = await exec.apply(this, arguments)

    client.hset(this.haskedKey, key, JSON.stringify(val))

    console.log('from db')

    return val

}


module.exports = {
    clearHash(haskedKey){
        client.del(JSON.stringify(haskedKey))
    }
}




