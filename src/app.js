import express from "express"
import routes from "./routes/routes.js"




//Create application and set it to use jsonb and movie routes.
const app = express();
app.use(express.json());    //Without this, the body will be undefined
app.use("movies", routes);

const PORT = process.env.PORT || 5000

// Only connect to Mongo if not in test 
// TODO adjust the mongoose.connect address when the api isn't running localy anymore, but on Railway or render.
if (process.env.NODE_ENV !== "test") {
  mongoose.connect("mongodb://localhost:27017/mini_api", { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  });
}

export default app