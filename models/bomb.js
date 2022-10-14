const req = require('express/lib/request')
const mongoose = require('mongoose')


const bombSchema = new mongoose.Schema({
    throwerName: {
        type: String,
    },
    world: {
        type: Number,
        required: true,
    },
    bombType: {
        type: String,
        required: true,
    },
    thrownAt: {
        type: Date,
        default: Date.now(),
    },
    expiredAt: {
        type: Date,
        required: true,
    }
})

module.exports = mongoose.model('Bomb', bombSchema)