const express = require('express')
const app = express()
const port = process.env.PORT

require('./db/mongoose')

const userRouter = require('../router/user')
const adminRouter = require('../router/admin')

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)

app.listen(port,()=>{
    console.log('Server is running on port '+port)
})