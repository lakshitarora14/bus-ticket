const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    PassengerName: {
        type: String,
        required: true,
        trim: true,

    },
    seatNumber: {
        type: Number,
        required: true,
        trim: true,
        min: 1,
        max: 40,
        unique:true
    },
    isBooked: {
        type: Boolean,
        default:true
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    age: {
        type: String,
        required: true,
        trim: true,
        max:100
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    }
})

const Ticket = mongoose.model('ticket', ticketSchema)

module.exports = Ticket