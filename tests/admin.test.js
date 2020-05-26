const request = require('supertest')
const app = require('../src/app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Admin = require('../src/models/admin')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
    "_id": testUserId,
    "email": "admin@gmail.com",
    "password": "admin1@123",
    "token": jwt.sign({ _id: testUserId }, process.env.JWT_ADMIN)
}

beforeEach(async () => {
    await Admin.deleteMany()
    await new Admin(testUser).save()
})


test("Signing up a new admin", async () => {
    const response = await request(app)
        .post('/admin/signUp')
        .send({
            "email": "test-admin@gmail.com",
            "password": "admin1@123"
        })
        .expect(201)
})

test("Logging in existing admin user", async () => {
    await request(app).post('/admin/login')
        .send({
            "email": testUser.email,
            "password": testUser.password
        })
        .expect(200)
})

test("Failure to login because of wrong password", async () => {
    await request(app).post('/admin/login')
        .send({
            "email": testUser.email,
            "password": "Thisisincorrect"
        })
        .expect(400)
})

test("Password is being encrypted", async () => {
    const user = await Admin.findById({ _id: testUserId })
    expect(user.password).not.toBe(testUser.password)
})

test("Admin is being logged out", async () => {
    const response = await request(app)
        .post('/admin/logout')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send()
        .expect(200)
})

test("All values are being deleted", async () => {
    const response = await request(app)
        .delete('/admin/deleteAll')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send()
        .expect(200)
})

test("All tickets can be seen", async () => {
    const response = await request(app)
        .get('/admin/tickets')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send()
        .expect(200)
})

