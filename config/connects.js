import mongoose from "mongoose";
export const dbConnect = () => {
  const mongooseConnect = process.env.MONGO_URL;
  
  if (mongooseConnect) {
    mongoose.connect(mongooseConnect);
  }
  mongoose.Promise = global.Promise;

  const connection = mongoose.connection;
  connection.on("connected", () => {
    console.log("Mongodb is connected");
  });

  connection.on("error", (err) => {
    console.log("error in  mongodb connection", err);
  });
  return mongoose
};

