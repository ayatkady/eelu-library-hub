const validator = require("validator");

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

const validateRegister = (body) => {
  const errors = [];
  const fullName = clean(body.fullName);
  const email = clean(body.email).toLowerCase();
  const password = clean(body.password);
  const faculty = clean(body.faculty) || "IT";
  const academicYear = clean(body.academicYear) || "Year 1";

  if (fullName.length < 3) errors.push("Full name is required");
  if (!validator.isEmail(email)) errors.push("Valid email is required");
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!["IT", "BA"].includes(faculty)) errors.push("Faculty must be IT or BA");
  if (!["Year 1", "Year 2", "Year 3", "Year 4"].includes(academicYear)) {
    errors.push("Academic year must be Year 1, Year 2, Year 3, or Year 4");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: { fullName, email, password, faculty, academicYear },
  };
};

const validateLogin = (body) => {
  const errors = [];
  const email = clean(body.email).toLowerCase();
  const password = clean(body.password);

  if (!validator.isEmail(email)) errors.push("Valid email is required");
  if (!password) errors.push("Password is required");

  return {
    ok: errors.length === 0,
    errors,
    data: { email, password },
  };
};

const validateBook = (body, isUpdate = false) => {
  const errors = [];
  const title = clean(body.title);
  const author = clean(body.author);
  const category = clean(body.category);
  const faculty = clean(body.faculty) || "IT";
  const academicYear = clean(body.academicYear) || "Year 1";
  const description = clean(body.description);
  const coverImageUrl = clean(body.coverImageUrl);
  const pdfUrl = clean(body.pdfUrl);
  const totalCopies = Number(body.totalCopies);
  const availableCopies = body.availableCopies === undefined ? totalCopies : Number(body.availableCopies);

  if (!isUpdate || body.title !== undefined) {
    if (title.length < 2) errors.push("Title is required");
  }
  if (!isUpdate || body.author !== undefined) {
    if (author.length < 2) errors.push("Author is required");
  }
  if (!isUpdate || body.category !== undefined) {
    if (category.length < 2) errors.push("Category is required");
  }
  if (!isUpdate || body.faculty !== undefined) {
    if (!["IT", "BA"].includes(faculty)) errors.push("Faculty must be IT or BA");
  }
  if (!isUpdate || body.academicYear !== undefined) {
    if (!["Year 1", "Year 2", "Year 3", "Year 4"].includes(academicYear)) {
      errors.push("Academic year must be Year 1, Year 2, Year 3, or Year 4");
    }
  }
  if (!isUpdate || body.description !== undefined) {
    if (description.length < 10) errors.push("Description must be at least 10 characters");
  }
  if (body.totalCopies !== undefined || !isUpdate) {
    if (!Number.isInteger(totalCopies) || totalCopies < 0) errors.push("Total copies must be a positive integer");
  }
  if (body.availableCopies !== undefined || !isUpdate) {
    if (!Number.isInteger(availableCopies) || availableCopies < 0) errors.push("Available copies must be a positive integer");
  }
  if ((body.totalCopies !== undefined || body.availableCopies !== undefined) && availableCopies > totalCopies) {
    errors.push("Available copies cannot exceed total copies");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: { title, author, category, faculty, academicYear, description, coverImageUrl, pdfUrl, totalCopies, availableCopies },
  };
};

const validateContact = (body) => {
  const errors = [];
  const name = clean(body.name || body.fullName);
  const email = clean(body.email).toLowerCase();
  const subject = clean(body.subject);
  const message = clean(body.message);

  if (name.length < 3) errors.push("Name is required");
  if (!validator.isEmail(email)) errors.push("Valid email is required");
  if (subject.length < 3) errors.push("Subject is required");
  if (message.length < 10) errors.push("Message must be at least 10 characters");

  return {
    ok: errors.length === 0,
    errors,
    data: { name, email, subject, message },
  };
};

module.exports = {
  clean,
  isValidObjectId,
  validateRegister,
  validateLogin,
  validateBook,
  validateContact,
};