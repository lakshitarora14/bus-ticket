const express = require('express')
const app = express()

require('./db/mongoose')

const userRouter = require('./router/user')
const adminRouter = require('./router/admin')

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)

module.exports = app