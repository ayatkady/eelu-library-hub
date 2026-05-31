const Book = require("../models/Book");

// CREATE
const addBook = async (req, res) => {

  const book = await Book.create(req.body);

  res.json(book);

};

// READ ALL
const getBooks = async (req, res) => {

  const books = await Book.find();

  res.json(books);

};

// UPDATE
const updateBook = async (req, res) => {

  const book =
  await Book.findByIdAndUpdate(

    req.params.id,

    req.body,

    { new:true }

  );

  res.json(book);

};

// DELETE
const deleteBook = async (req,res)=>{

  await Book.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message:"Deleted"
  });

};

module.exports={

addBook,
getBooks,
updateBook,
deleteBook

};