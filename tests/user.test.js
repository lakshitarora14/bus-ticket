const request = require('supertest')
const app = require('../src/app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../src/models/user')
const Ticket = require('../src/models/ticket')


const testUserId = new mongoose.Types.ObjectId()
const testUser = {
    "_id": testUserId,
    "name": "lakshit1",
    "email": "lakshit1@gmail.com",
    "password": "user1@123",
    "token": jwt.sign({ _id: testUserId }, process.env.JWT_USER)
}

const testTicketId = new mongoose.Types.ObjectId()
const testTicket = {
    "_id": testTicketId,
    "PassengerName": "lakshit",
    "seatNumber": "1",
    "age": "21",
    "gender": "male",
    "phone": "8888888888",
    "date": Date.now(),
    "isBooked": true,
    "bookedBy": testUserId
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(testUser).save()
})


test("Signing up a new user", async () => {
    const response = await request(app)
        .post('/user/signUp')
        .send({
            "name": "lakshit",
            "email": "lakshit@gmail.com",
            "password": "user@123"
        })
        .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).
        toMatchObject({
            "name": "lakshit",
            "email": "lakshit@gmail.com",
        })
})

test("Signing up a new user with invalid email", async () => {
    const response = await request(app)
        .post('/user/signUp')
        .send({
            "name": "lakshit",
            "email": "lakshitgmail.com",
            "password": "user@123"
        })
        .expect(400)
})

test("Signing up a new user with invalid password", async () => {
    const response = await request(app)
        .post('/user/signUp')
        .send({
            "name": "lakshit",
            "email": "lakshitgmail.com",
            "password": "123"
        })
        .expect(400)
})

test("Logging in existing user", async () => {
    await request(app)
        .post('/user/login')
        .send({
            "email": testUser.email,
            "password": testUser.password
        }).expect(200)
})

test("Failure to login because of wrong password", async () => {
    await request(app)
        .post('/user/login')
        .send({
            "email": testUser.email,
            "password": "Thisisincorrect"
        }).expect(400)
})

test("Getting profile of user", async () => {
    await request(app)
        .get('/user/me')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send()
        .expect(200)
})

test("Should not get profile of user", async () => {
    await request(app)
        .get('/user/me')
        .send()
        .expect(401)
})

test("Password is being encrypted", async () => {
    const user = await User.findById({ _id: testUserId })
    expect(user.password).not.toBe(testUser.password)
})

test("User is being logged out", async () => {
    const response = await request(app)
        .post('/user/logout')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send()
        .expect(200)
})

test("User is being logged out", async () => {
    const response = await request(app)
        .post('/user/logout')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send()
        .expect(200)
})

test("User cannot log out because unauthorized", async () => {
    const response = await request(app)
        .post('/user/logout')
        .send()
        .expect(401)
})

test("Booking ticket successfully", async () => {
    const response = await request(app)
        .post('/user/bookTicket')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            "PassengerName": "lakshit",
            "seatNumber": "1",
            "age": "21",
            "gender": "male",
            "phone": "8888888888"
        })
        .expect(201)
})

test("On booking ticket id of User who booked is being stored", async () => {
    const response = await request(app)
        .post('/user/bookTicket')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            "PassengerName": "lakshit",
            "seatNumber": "2",
            "age": "21",
            "gender": "male",
            "phone": "8888888888"
        })
        .expect(201)

    const ticket = await Ticket.find({})
    expect(ticket[0]).
        toMatchObject({
            "bookedBy": testUser._id,
        })
})

test("Booking ticket failed because seat number greater than 40", async () => {
    const response = await request(app)
        .post('/user/bookTicket')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            "PassengerName": "lakshit",
            "seatNumber": "41",
            "age": "21",
            "gender": "male",
            "phone": "8888888888"
        })
        .expect(400)
})

test("Booking ticket failed because seat number less than 1", async () => {
    const response = await request(app)
        .post('/user/bookTicket')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            "PassengerName": "lakshit",
            "seatNumber": "0",
            "age": "21",
            "gender": "male",
            "phone": "8888888888"
        })
        .expect(400)
})

test("Booking ticket failed because seat number already taken", async () => {
    const response = await request(app)
        .post('/user/bookTicket')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            "PassengerName": "lakshit",
            "seatNumber": "1",
            "age": "21",
            "gender": "male",
            "phone": "8888888888"
        })
        .expect(400)
})

test("Booking ticket failed because not authorized", async () => {
    const response = await request(app)
        .post('/user/bookTicket')
        .send({
            "PassengerName": "lakshit",
            "seatNumber": "10",
            "age": "21",
            "gender": "male",
            "phone": "8888888888"
        })
        .expect(401)
})


test("Editing ticket details failing because of unautorization", async () => {
    const response = await request(app)
        .patch('/user/editTicket/' + testTicketId)
        .send({
            "PassengerName": "arora",
        })
        .expect(401)
})

test("All booked tickets are viewed", async () => {
    const response = await request(app)
        .get('/allTickets')
        .send()
        .expect(200, [
            { isBooked: true, seatNumber: 1 },
            { isBooked: true, seatNumber: 2 }
        ])
})

test("All closed tickets are viewed", async () => {
    const response = await request(app)
        .get('/closeTickets')
        .send()
        .expect(200, [
            { isBooked: true, seatNumber: 1 },
            { isBooked: true, seatNumber: 2 }
        ])
})
