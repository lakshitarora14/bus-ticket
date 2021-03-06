const express = require('express')
const User = require('../models/user')
const Ticket = require('../models/ticket')
const auth = require('../middleware/auth')

const router = new express.Router()


router.post('/user/signUp', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }
    catch (error) {
        res.status(400).send(error.message)
    }

})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
    catch (error) {
        res.status(400).send()
    }
})

router.post('/user/logout', auth.authUser, async (req, res) => {
    try {
        req.user.token = ""
        await req.user.save()
        res.status(200).send({ success: 'Logged Out Successfully' })
    }
    catch (error) {
        res.status(500).send()
    }
})

router.post('/user/bookTicket', auth.authUser, async (req, res) => {  
    const prevTicket = await Ticket.findOne({seatNumber : req.body.seatNumber})
    const pnrNumber = prevTicket._doc._id
    if(prevTicket.isBooked === true)
    {
        return res.send("Sorry this seat is already booked")
    }
    const ticket = new Ticket(req.body)
    try {
        ticket.bookedBy = req.user._id
        ticket.date = Date.now()
        var upsertData = ticket.toObject();
        delete upsertData._id;
        await Ticket.findOneAndUpdate({seatNumber : req.body.seatNumber},upsertData,{upsert: true})
        res.status(201).send({ticket,"pnrNumber":pnrNumber})
    }
    catch (error) {
        res.status(400).send(error.message)
    }
})

router.get('/allTickets', async (req, res) => {
    const status = req.params.status
    try {
        const tickets = await Ticket.find({}).select('seatNumber isBooked -_id')
        res.send(tickets)

    } catch (error) {
        res.status(500).send()
    }
})


router.get('/openTickets', async (req, res) => {
    const status = req.params.status
    try {
        const tickets = await Ticket.find({ isBooked: false }).select('seatNumber isBooked -_id')
        res.send(tickets)

    } catch (error) {
        res.status(500).send()
    }
})

router.get('/closeTickets', async (req, res) => {
    const status = req.params.status
    try {
        const tickets = await Ticket.find({ isBooked: true }).select('seatNumber isBooked -_id')
        res.send(tickets)

    } catch (error) {
        res.status(500).send()
    }
})

router.get('/user/me', auth.authUser, async (req, res) => {
    res.send(req.user)
})

router.get('/ticketStatus/:id', async (req, res) => {
    const id = req.params.id
    try {
        const ticket = await Ticket.find({ _id: id })
        res.send(ticket)

    } catch (error) {
        res.status(500).send({ error: 'Invalid ID' })
    }
})

router.patch('/user/editTicket/:id', auth.authUser, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['PassengerName', 'isBooked', 'age', 'gender', 'phone']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'invlid field cannot update' })
    }
    try {
        const ticket = await Ticket.findById(req.params.id)
        updates.forEach((update) => ticket[update] = req.body[update])
        await ticket.save()
        if (!ticket) {
            return res.status(400).send()
        }
        res.send(ticket)
    }
    catch (error) {
        res.status(400).send(error)
    }

})

module.exports = router