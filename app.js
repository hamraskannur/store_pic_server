import  express  from "express";
import dotenv from 'dotenv';
import CORS from "cors"
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';


import { dbConnect } from "./config/connects.js"
import {setupScheduledJob} from "./controllers/dayCheck.js"
import userRoutes from "./routes/userRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    CORS({
      origin: ["http://localhost:4200","https://hamraskannur.github.io/Store_Pic_Angular_Frontend/#","https://hamraskannur.github.io"],
      methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
      credentials: true,
      exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    })
  );

app.use("/" ,userRoutes)
app.use("/admin" ,adminRoutes)



const port=3008
app.listen(port,()=>{
    dbConnect()
    console.log(`server connection port : ${port}`);
})

setupScheduledJob()