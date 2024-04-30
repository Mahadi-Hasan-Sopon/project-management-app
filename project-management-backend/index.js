const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slptvwz.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;

// const localURI = "mongodb://127.0.0.1:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // database
    const database = client.db("projectManagement");

    // collections
    const projectCollection = database.collection("projects");

    //  Routes

    // get all projects
    app.get("/projects", async (req, res) => {
      const cursor = projectCollection.find({});
      const projects = await cursor.toArray();
      res.send(projects);
    });

    // get project by id
    app.get("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const project = await projectCollection.findOne({ _id: ObjectId(id) });
      res.send(project);
    });

    // update a project
    app.put("/projects", async (req, res) => {
      const projectDetails = req.body;
      const result = await projectCollection.updateOne(
        { _id: ObjectId(projectDetails._id) },
        {
          $set: {
            ...projectDetails,
          },
        }
      );
      res.json(result);
    });

    // insert a new project
    app.post("/projects", async (req, res) => {
      const project = req.body;
      const result = await projectCollection.insertOne(project);
      res.send(result);
    });

    // delete a project
    app.delete("/projects/:id", async (req, res) => {
      const projectId = req.params.id;
      const result = await projectCollection.deleteOne({
        _id: ObjectId(projectId),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You have successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`
    <h1>
      <center>Server is running at PORT ${port}</center>
    </h1>
  `);
});

app.listen(port, () => {
  console.log(`app is running at PORT ${port}`);
});
