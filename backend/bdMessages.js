import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    name:String,
    message:String,
    timestamp:String,
    received:Boolean
})

export default mongoose.model('messagecontent',messageSchema);