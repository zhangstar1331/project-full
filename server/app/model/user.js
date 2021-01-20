module.exports = app => {
    const mongoose = app.mongoose
    const UserSchema = new mongoose.Schema({
        email: {type: String, required: true},
        passwd: {type: String, required: true, select: false},
        nickname: {type: String, required: true},
        avatar: {type: String, required: false, default: '/user.png'}
    })
    return mongoose.model('User',UserSchema)
}