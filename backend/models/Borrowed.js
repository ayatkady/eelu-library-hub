const mongoose = require("mongoose");

const borrowedSchema = new mongoose.Schema({

  userId:{
    type:String,
    required:true
  },

  bookId:{
    type:String,
    required:true
  },

  status:{
    type:String,
    default:"borrowed"
  },

  borrowDate:{
    type:Date,
    default:Date.now
  },

  returnDate:Date

});

module.exports =
mongoose.model(
"Borrowed",
borrowedSchema
);