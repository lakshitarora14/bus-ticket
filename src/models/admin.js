const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
        trim: true
    },
    token: {
        type: String
    }
})

adminSchema.pre('save', async function (next) {
    const admin = this
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }
    next()
})

adminSchema.methods.generateAuthToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_ADMIN)
    admin.token = token
    await admin.save()
    return token
}

adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({ email })
    if (!admin) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return admin
}

const Admin = mongoose.model('admin', adminSchema)

module.exports = Admin