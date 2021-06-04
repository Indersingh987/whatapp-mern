import express from 'express'
import mongoose from 'mongoose'
import Messages from './bdMessages.js'
import cors from 'cors'
import Pusher from 'pusher'

//app config
const app = express();
const port = process.env.PORT || 5000

//middleware
app.use(express.json())
app.use(cors())

//config db
const url = 'mongodb+srv://inder:nJXjbyjMVkoJyLyd@cluster0.gi7zc.mongodb.net/whatsaapDB?retryWrites=true&w=majority'
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

//making db real time
const pusher = new Pusher({
    appId: "1214333",
    key: "baf215abe5b166a4e758",
    secret: "1d000ad839b774723b5f",
    cluster: "ap2",
    useTLS: true
});

const db = mongoose.connection
db.once('open',()=>{
    console.log('db connected')

    const mgCollection = db.collection('messagecontents')
    const changeStream = mgCollection.watch();

    changeStream.on('change',(change)=>{
        
        if(change.operationType === 'insert'){
            const messageDetail = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name:messageDetail.name,
                message:messageDetail.message,
                timestamp:messageDetail.timestamp,
                received:messageDetail.received
            });
        }
    })
})

//routes
app.get('/',(req,res)=>{
    res.status(200).send('API is running...')
})
app.get('/api/messages/sync',(req,res)=>{
    Messages.find({},(err,doc)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(doc)
        }
    })
})
app.post('/api/messages/new',(req,res)=>{
    const dbMessage = req.body
    
    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data);
        }
    })
})

//listner
app.listen(port,console.log(`server is running at ${port}`))

