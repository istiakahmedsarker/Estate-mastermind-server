const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const stripe = require("stripe")('sk_test_51KC1ZmI7BqVrKYKIqSkrcazSq8S70LLr86RNBLlwZXsb2UFC1bQVmPMuZZMm8If6h6A5bCdcTw5r6xpXaFhPQOdi00uDJgvMlC');

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6htyl8q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const apartmentCollection = client.db("bulidingManagement").collection("buildingDb");
        const agreementCollection = client.db("bulidingManagement").collection("agreementDb");
        const userCollection = client.db("bulidingManagement").collection("usersDb");
        const announcementCollection = client.db("bulidingManagement").collection("announcementsDb");
        const couponCollection = client.db("bulidingManagement").collection("couponsDb");
        const paymentCollection = client.db("bulidingManagement").collection("payments");


        // users related api
        app.get('/apartments', async (req, res) => {
            const result = await apartmentCollection.find().toArray();
            res.send(result);
        });
        // get announcements
        app.get('/announcements', async (req, res) => {
            const result = await announcementCollection.find().toArray();
            res.send(result);
        });
        app.post("/signedUser", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
        // send users
        app.get("/getUsers", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        app.get("/getProfileData/:email", async (req, res) => {
            const query = req.params.email;
            // Fetch data from your database based on the provided email
            // For example:
            const result = await agreementCollection.find({ email: query }).toArray();

            res.send(result)
        });


        app.get("/getCoupons", async (req, res) => {
            const result = await couponCollection.find().toArray();
            res.send(result);
        });
        // send agreements
        app.get("/getAgreements", async (req, res) => {
            const result = await agreementCollection.find().toArray();
            res.send(result);
        });

        app.put("/acceptUserEmail/:email", async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.updateOne(
                { email: email },
                {
                    $set: {
                        role: 'member'
                    }
                },
                { upsert: true }
            );
            res.send({ result });
        });


        app.put("/acceptUser/:id", async (req, res) => {
            const id = req.params.id;
            const result = await agreementCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        status: 'checked'
                    }
                },
                { upsert: true }
            );
            res.send({ result });
        });

        app.put("/rejectUserEmail/:email", async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.updateOne(
                { email: email },
                {
                    $set: {
                        role: 'user'
                    }
                },
                { upsert: true }
            );
            res.send({ result });
        });

        app.put("/rejectUser/:id", async (req, res) => {
            const id = req.params.id;
            const result = await agreementCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        status: 'checked'
                    }
                },
                { upsert: true }
            );
            res.send({ result });
        });


        app.put("/deleteUser/:id", async (req, res) => {
            const id = req.params.id;
            const result = await userCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set:
                        { role: 'user' },
                },
                { upsert: true }
            );
            res.send({ result });
        });

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        // check admin
        app.get("/checkAdmin/:email", async (req, res) => {
            const query = req.params.email;
            const result = await userCollection.find({ email: query }).toArray();
            res.send(result);
        });
        // add announcement 
        app.post("/addAnnouncement", async (req, res) => {
            const user = req.body;
            const result = await announcementCollection.insertOne(user);
            res.send(result);
        });

        app.post("/payments", async (req, res) => {
            const user = req.body;
            const result = await paymentCollection.insertOne(user);
            res.send(result);
        });
        app.get("/paymentHistory/:email", async (req, res) => {
            const query = req.params.email;
            const result = await paymentCollection.find({ email: query }).toArray();
            res.send(result);
        });
        //add coupon
        app.post("/addCoupon", async (req, res) => {
            const user = req.body;
            const result = await couponCollection.insertOne(user);
            res.send(result);
        });
        app.get("/getCoupons", async (req, res) => {
            const result = await couponCollection.find().toArray();
            res.send(result);
        });


        // agreement related api
        app.post("/agreement", async (req, res) => {
            const agreement = req.body;
            const result = await agreementCollection.insertOne(agreement);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('yoyo is running')
})

app.listen(port, () => {
    console.log(`Building management  is sitting on port ${port}`);
})