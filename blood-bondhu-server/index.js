const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middlewares
app.use(cors(
  {origin:'*'}
));
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhwjvgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri ="mongodb+srv://navid:navidzaman@cluster0.f9ovn9i.mongodb.net/";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  const logger = (req, res, next) =>{
    console.log('log info: ', req.method, req.url)
    next()
  }
  
  // const verifyToken = (req,res,next)=>{
  //   const token = req.cookies?.token
  //   // console.log('token in the middleware', token)
  //   if(!token){
  //       return res.status(401).send({message: 'Unauthorized Access'})
  //   }
  //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) =>{
  //       if(err){
  //           return res.status(401).send({message: 'Unauthorized Access'})
  //       }
  //       req.user = decode
  //       console.log(decode)
  //       next()
  //   })
  // }
  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
  
      const userCollection = client.db("BloodBondhu").collection('user');
      const donorCollection = client.db("BloodBondhu").collection('donor');
      const postCollection = client.db("BloodBondhu").collection('post');
      const textCollection = client.db("BloodBondhu").collection('text');
      const graphCollection = client.db("BloodBondhu").collection('graph');
  
      app.get('/user', async(req,res) =>{
        const checkEmail = req.query.email
        console.log(checkEmail)
        const search = await userCollection.findOne({email: checkEmail})
        console.log(search)
        if(!search){
          return res.status(404).send({ message: 'Email not found' });
        }
        if(search.role === 'admin'){
          return res.send(search)
        }
        else{
          return res.status(403).send({message: 'This is not a admin'})
        }
    })

    app.get('/allUser', async(req,res)=>{
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      
      res.send(result)
    })

    app.post('/user', async(req,res) =>{
      const userInfo = req.body;
      console.log(userInfo)
      const check = await userCollection.findOne({email: userInfo.email})
      if (check && check.email === userInfo.email){
        // userCollection.updateOne({email: check.email},{$set: userInfo})
        return res.status(400).send({message: "email already exist"})
      }
      else{
        const result = await userCollection.insertOne(userInfo);
      }
      res.send(userInfo)
    })

      //Nvaid
         

      //posts getting
      app.get('/posts', async(req,res) =>{
        try {
          const filter = { donorname: "none" };
          const cursor = postCollection.find(filter);
          const result = await cursor.toArray();
          res.send(result);
      } catch (error) {
          console.error(error);
          res.status(500).send('Error fetching posts');
      }
    })

      //emergency posts getting
      app.get('/emergencyposts', async(req,res) =>{
        
          const filter = { donorname: "none" };
          const cursor =  postCollection.find(filter);
  
          res.send(result);
      




    })

    //request box 
    app.get('/requestbox/:email', async(req,res) =>{
	  
      
      const filter = { 
$and: [
    { donorname: "none" }, 
    { emergency: "yes" }, 
    { email: { $ne: req.params.email } }
]
};
      const cursor = postCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);

})






    //post creation

    app.post('/newpost', async(req,res) =>{
      const postInfo = req.body;
      console.log(postInfo)
      const result = await postCollection.insertOne(postInfo);
      res.send(postInfo)
    })
    //////////////////////////////TEXTING

    //CREATE TEXT
    app.post('/createtext', async(req,res) =>{
      const postInfo = req.body;
      console.log(postInfo)
      const result = await textCollection.insertOne(postInfo);
      res.send(postInfo)
    })
    //get all text

    app.get('/alltext', async(req,res)=>{
      const cursor = textCollection.find()
      const result = await cursor.toArray()
      console.log(result)
      res.send(result)
    })

    // app.get('/textsender/:email', async (req, res) => {
    //   try {
    //     const mail = req.params.email;
    //     const cursor = textCollection.find({ sender: { $ne: mail } });
    //     const result = await cursor.toArray();
    //     console.log(result);
    //     res.send(result);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });



    // app.get('/textrecever/:email', async (req, res) => {
    //   try {
    //     const mail = req.params.email;
    //     const cursor = textCollection.find({ recever: { $ne: mail } });
    //     const result = await cursor.toArray();
    //     console.log(result);



    //     res.send(result);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });
    // app.get('/textrecever/:email', async (req, res) => {
    //   try {
    //     const mail = req.params.email;
    
    //     // Aggregate to get distinct receiver fields along with their names
    //     const result = await textCollection.aggregate([
    //       { $match: { recever: { $ne: mail } } }, // Exclude documents with the specified email
    //       { $group: { _id: "$recever", recevername: { $first: "$recevername" } } }, // Group by receiver and get the first receiver name
    //       { $project: { _id: 0, recever: "$_id", recevername: 1 } } // Project the fields to match the desired format
    //     ]).toArray();
    
    //     console.log(result);
    
    //     res.send(result);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });
    app.get('/textsender/:email', async (req, res) => {
      try {
        const mail = req.params.email;
        const pipeline = [
          {
            $match: { recever:  mail } // Exclude documents with matching receiver
          },
          {
            $group: {
              _id: "$sender",
              recevernames: { $addToSet: "$sendername" } // Collect all unique receivernames
            }
          }
        ];
        const distinctReceivers = await textCollection.aggregate(pipeline).toArray();
        res.send(distinctReceivers);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
    app.get('/textrecever/:email', async (req, res) => {
      try {
        const mail = req.params.email;
        const pipeline = [
          {
            $match: { recever:  mail  } // Exclude documents with matching receiver
          },
          {
            $group: {
              _id: "$recever",
              recevernames: { $addToSet: "$recevername" } // Collect all unique receivernames
            }
          }
        ];
        const distinctReceivers = await textCollection.aggregate(pipeline).toArray();
        res.send(distinctReceivers);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    /////////////////////////////////










//geting filter messeg
    app.get('/text/:sender/:receiver', async(req,res) =>{
      let data=req.params
     
      console.log(data.email)
      const cursor = textCollection.find({
        $and: [
          {
            $or: [
              { sender: data.sender },
              { sender: data.receiver }
            ]
          },
          {
            $or: [
              { recever: data.sender },
              { recever: data.receiver }
            ]
          }
        ]
      }).sort({ now: -1 }); // Sort by 'now' field in descending order
      const result = await cursor.toArray();
      console.log(result)
      res.send(result)
  })



    //  //get some text

    //  app.get('/textsender/:email', async(req,res)=>{
    //   const mail = req.params.email;
    //   const cursor = textCollection.findMany({sender:mail})

    //   const result = await cursor.toArray()
    //   console.log(result)
    //   res.send(result)
    // })



    //notiofying route

    app.put('/notify', async(req,res) =>{ //////////////////////////prblem
      const post = req.body;
      console.log(post.newBooks._id)
     
      const newdata=post.newBooks
    //   console.log(newdata._id);
 
      //const objectIds = new ObjectId(newdata._id);
      const result=await donorCollection.updateMany(
        {
          $and: [
            { email: { $ne: post.email } }, // Email not equal to the new email
            { area: { $in: post.adjacent } } // Area matches adjacent areas
          ]
        },
        {
          $push: {
            requests: {
    postid:  newdata._id
            }
          }
        }
      )
      
      res.send(newdata)
    })


    //addREsponse route
    app.put('/addresponse', async(req,res) =>{
      const newdata = req.body;
      console.log(newdata.curent)
      
      const post=newdata.curent
      console.log(post)
     
      const objectIds = new ObjectId(newdata.postId);
       
      const result = await postCollection.updateOne(
        { _id: objectIds },
        {
          $push: {
            request: {
              _id: new ObjectId(newdata._id),
              donorName: post.donorName,
              phone: post.phone,
              email: post.email,
              bloodGroup: post.bloodGroup,
              gender: post.gender,
              DOB: post.DOB,
              address: post.address,
              lastDonate: post.lastDonate,
              bivag: post.bivag,
              zilla: post.zilla,
              area: post.area,
              texts: post.texts,
              donated: post.donated,
              received: post.received,
              mypost: post.mypost,
              requests: post.requests,
              reports: post.reports 
                 
                  
            } // Modify this line to push a new object with the field name "post"
          }
        }
      );
     

     
      
      res.send(result)
    })
 
    app.get('/getdonor', async(req,res) =>{
      console.log

      const cursor = donorCollection.find();
        const result = await cursor.toArray();
        res.send(result)

  })

  app.get('/getdonor/:email', async(req,res) =>{
    const ids = req.params.email;
    const query = {email: ids}
    const result = await donorCollection.findOne(query)
    
    res.send(result)
})
//top donor

app.get('/topdonor', async (req, res) => {
  try {
    // Add logging to see if the route is being hit
   console.log('Received request to /topdonor');

    const cursor = postCollection.aggregate([
      {
        $match: { donorname: { $ne: "none" } } // Filter out entries where donorname is "None"
      },
      {
        $group: {
          _id: "$donorname",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    const result = await cursor.toArray();
    console.log( result);
    

    res.send(result);
  } catch (error) {
    
  }
});
//update donated

app.put('/updatedonation', async(req,res) =>{
  const updates = req.body;
 
 
 
    
  for (const update of updates) {
    await donorCollection.updateOne(
        { email: update._id }, // Matching condition
        { $set: { donated: update.count } } // Update operation
    );
}  
  
})

app.get('/topsortdonor', async (req, res) => {
  const donors = await donorCollection.find({ donated: { $gt: 0 } }).sort({ donated: -1 }).toArray();
  console.log(donors)
  res.send(donors);
});







// app.get('/topdonor', async (req, res) => {
//   try {
//     // Add logging to see if the route is being hit
//     console.log('Received request to /topdonor');

//     const cursor = postCollection.aggregate([
//       {
//         $match: { donorname: { $ne: "none" } } // Filter out entries where donorname is "None"
//       },
//       {
//         $group: {
//           _id: "$donorname",
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $sort: { count: -1 }
//       }
//     ]);
//     const result = await cursor.toArray();
//     console.log( result);
    

//     res.send(result);
//   } catch (error) {
    
//   }
// });












//get graph

app.get('/getgraph/:location', async(req,res) =>{
  const loc = req.params.location;
  console.log(loc)
  const query = {location: loc}
  const result = await graphCollection.findOne(query)
  console.log(result)
 const connections=result.connections;
 const posts = await postCollection.find({ $and: [{ area: { $in: connections } }, { donorname: "none" },{emergency: "yes"}] }).toArray();
  res.send(posts)
})

//////////////////////////////////////////////requestBox



app.get('/requestpost/:email', async(req,res) =>{
  let data=req.params
  console.log(data)
  console.log(data.email)
  const cursor = postCollection.find({
    $and: [
      { email:{$ne: data.email} },
      { donorname: "none" }
    ]
  });
  const result = await cursor.toArray();
  console.log(result)
  res.send(result)
})

//post delet 

app.delete('/postdelete/:id', async (req, res) => {
  const postId = req.params.id;
console.log(postId)
  try {
    const result = await postCollection.deleteOne({ _id: new ObjectId(postId) });

    if (result.deletedCount === 1) {
      res.status(200).send({ message: 'Post deleted successfully' });
    } else {
      res.status(404).send({ message: 'Post not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred while deleting the post' });
  }
});





        //getting post by email and no donor found
        app.get('/posts/:email', async(req,res) =>{
          let data=req.params
          console.log(data)
          console.log(data.email)
          const cursor = postCollection.find({
            $and: [
              { email: data.email },
              { donorname: "none" }
            ]
          });
          const result = await cursor.toArray();
          console.log(result)
          res.send(result)
      })
      //confirming blood recieve

      app.put('/confirmation', async(req,res) =>{
        const newdata = req.body;
        const donormail=newdata.donormail
        console.log(donormail)
        const objectIds = new ObjectId(newdata.postid);
        const result=await postCollection.updateOne(

          { _id: objectIds },{ $set: { donorname: donormail } }
           
        
           
        )
       // console.log(result)
        
        res.send(result)
      })
             
    
      app.post('/donor', async(req,res) =>{
        const donorInfo = req.body;
        console.log(donorInfo)
        const check = await donorCollection.findOne({email: donorInfo.email})
        if (check === donorInfo.email){
          return res.status(400).send({message: "already registered"})
        }
        else{
          const result = await donorCollection.insertOne(donorInfo);
        }
        res.send(donorInfo)
      })

      // Send a ping to confirm a successful connection
      // await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);






app.get('/', (req,res) =>{
    res.send("Blood Bondhu Website running ")
})

app.listen(port,() => {
    console.log(`Server Running on port: ${port}`)
})