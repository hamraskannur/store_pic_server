import { model, Schema } from "mongoose";

const imageSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "user"
    },
    image: {
      type: String,
      required: true,
    },
    Thumbnail:{
      type: String,
      required: true,
    },
    fullLink:{
      type:String,
      required: true,
    },
    html:{
      type:String,
      required: true,
    },
    thumbnailHtml:{
      type:String,
      required: true,
    },
    expiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model("image", imageSchema);
