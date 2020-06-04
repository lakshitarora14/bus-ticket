const express = require('express')
const app = express()
const Ticket = require('./models/ticket')

require('./db/mongoose')

const userRouter = require('./router/user')
const adminRouter = require('./router/admin')

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)

for(let  index =1;index<=40;index++){
    Ticket.create({
        seatNumber : index,
        isBooked : false
    },function(err,res){
        if(err){
            console.error(err.errmsg)
            
        }
    })
}

module.exports = app