const express = require('express')
const Admin = require('../models/admin')
const Ticket = require('../models/ticket')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/admin/signUp', async (req, res) => {
    const admin = new Admin(req.body)
    try {
        const abc = await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).send({ admin, token })
    }
    catch (error) {
        res.status(400).send(error.message)
    }

})

router.post('/admin/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    }
    catch (error) {
        res.status(400).send()
    }
})

router.post('/admin/logout', auth.authAdmin, async (req, res) => {
    try {
        req.admin.token = ""
        await req.admin.save()
        res.status(200).send({ success: 'Logged Out Successfully' })
    }
    catch (error) {
        res.status(500).send()
    }
})

router.delete('/admin/deleteAll', async (req, res) => {
    try {
        const deleteMany = await Ticket.deleteMany({}, (err) => {
            if (err) {
                throw new Error('Delete All Failed')
            }
        })
        res.send(deleteMany)

    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/admin/tickets/:status', auth.authAdmin, async (req, res) => {
    const status = req.params.status
    try {
        if (status === 'open') {
            const tickets = await Ticket.find({ isBooked: false })
            res.send(tickets)
        }
        else if (status === 'close') {
            const tickets = await Ticket.find({ isBooked: true })
            res.send(tickets)
        }

    } catch (error) {
        res.status(500).send()
    }
})

router.get('/admin/tickets', auth.authAdmin, async (req, res) => {
    const status = req.params.status
    try {
        const tickets = await Ticket.find({})
        res.send(tickets)

    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router