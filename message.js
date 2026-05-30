const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
    sender: {type: String , required: true},
    time: {type: Date, default: Date.now},
    room:{type: String , required: true},
    content:{type: String , required: true}  
})

const message = mongoose.model('message' , msgSchema)
module.exports = message