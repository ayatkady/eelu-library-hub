const mongoose=require("mongoose");

const bookSchema=new mongoose.Schema({

title:String,

author:String,

category:String

});

module.exports=
mongoose.model(
"Book",
bookSchema
);