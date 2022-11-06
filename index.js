const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
var jwt = require('jsonwebtoken');


const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello bubu from node')
})

app.listen(port,()=>{
    console.log(`listening from ${port}`)
})

const verifyJWT = (req, res, next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader){
        res.status(401).send({message:'unauthorized access'})
        
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , (err, decoded)=>{
        if(err){
            res.status(401).send({message:'unauthorized access'})
        }

        req.decoded = decoded
        next()

      });
}





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// global

const uri = "mongodb+srv://dbGeniusCar:AZK6joqZ8RBVEItf@cluster0.0vh6mry.mongodb.net/?retryWrites=true&w=majority";

// local


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async()=>{
    
    try{
        const serviceCollection = client.db("genuinCar").collection("services");
        const orderCollection = client.db('genuinCar').collection('orderLists')

       app.get('/services', async(req,res)=>{

        const cursor = serviceCollection.find({})
        const result = await cursor.toArray()
        // console.log(result)
        res.send(result)

       })

       app.get('/services/:id', async(req,res)=>{
           const id = req.params.id
           const query = {_id:ObjectId(id)}
           const result = await serviceCollection.findOne(query)
        //    const result = await cursor
            // console.log(result)
            res.send(result)
       })

       app.post('/jwt',(req,res)=>{

           const user = req.body
           const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
           res.send({token})
           
       })

       app.post('/checkout', async(req,res)=>{

            const orders = req.body
            const result = await orderCollection.insertOne(orders)
            // console.log(result)
            res.send(result)

       })

    //    orders Api

       app.get('/orders',verifyJWT, async(req,res)=>{
           
           const decoded = req.decoded
           const userEmail = req.query.email

           if(decoded.email !== userEmail){
               res.status(403).send({message:'forbidden'})
           }
           let query = {}
           if(userEmail){
               query = {
                   email:userEmail
               }
           }
          
           const cursor = orderCollection.find(query)
           const result = await cursor.toArray()

        //    console.log(result)

           res.send(result)

       })

    //    update order

    app.put('/orders/:id', async(req,res)=>{

        const id = req.params.id
        const status = req.body.status
        const filter = {_id:ObjectId(id)}
        const updateOrder = {
            $set:{
                status:status
            }
        }
        const result = await orderCollection.updateOne(filter,updateOrder)
        res.send(result)
        

    })

    //    delete order

    app.delete('/orders/:id', async(req,res)=>{

        const id = req.params.id
        const query = {_id:ObjectId(id)}
        const result = await orderCollection.deleteOne(query)
        res.send(result)
        

    })



    }
    finally{

    }


}
run().catch(console.dir)
