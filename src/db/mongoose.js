const mongoose = require('mongoose')

// mongoose.connect(process.env.MONGODB_URL, {
mongoose.connect('mongodb+srv://bus-ticket:bus-ticket@cluster0-pn3oi.mongodb.net/bus-ticket', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})