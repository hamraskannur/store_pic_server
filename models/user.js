import { model, Schema,  } from 'mongoose'

const userSchema = new Schema({
    username: {
    type: String,
    minlength: 6, 
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false
  },
  admin:{
    type: Boolean,
    default: false
  },
  key:{
    type :String,
    required: true,
  },
  profileImage:{
    type :String,
  },
},
{
  timestamps: true,
})

export default model('user', userSchema)
