const form = document.getElementById("book-form");
const bookList = document.getElementById("book-list");
const booksEmpty = document.getElementById("books-empty");

const currentYear = new Date().getFullYear();

// Fiecare validator întoarce mesajul de eroare sau "" dacă valoarea e validă.
const validators = {
  title(value) {
    if (value === "") return "Titlul este obligatoriu.";
    if (value.length < 2) return "Titlul trebuie să aibă cel puțin 2 caractere.";
    return "";
  },
  author(value) {
    if (value === "") return "Autorul este obligatoriu.";
    if (!/^[\p{L}][\p{L} .'-]+$/u.test(value)) {
      return "Autorul poate conține doar litere, spații, punct și cratimă.";
    }
    return "";
  },
  year(value) {
    if (value === "") return "Anul este obligatoriu.";
    if (!/^\d{1,4}$/.test(value)) return "Anul trebuie să fie un număr întreg.";
    const year = Number(value);
    if (year < 1000 || year > currentYear) {
      return `Anul trebuie să fie între 1000 și ${currentYear}.`;
    }
    return "";
  },
};

function validateField(input) {
  const message = validators[input.name](input.value.trim());
  document.getElementById(`${input.name}-error`).textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.setAttribute("aria-invalid", String(message !== ""));
  return message === "";
}

function addBook(book) {
  const item = document.createElement("li");

  const title = document.createElement("span");
  title.className = "book-title";
  title.textContent = book.title;

  const meta = document.createElement("span");
  meta.className = "book-meta";
  meta.textContent = `${book.author}, ${book.year}`;

  item.append(title, meta);
  bookList.append(item);
  booksEmpty.hidden = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const inputs = [form.title, form.author, form.year];
  const invalid = inputs.filter((input) => !validateField(input));
  if (invalid.length > 0) {
    invalid[0].focus();
    return;
  }

  addBook({
    title: form.title.value.trim(),
    author: form.author.value.trim(),
    year: Number(form.year.value.trim()),
  });
  form.reset();
  form.title.focus();
});

// După prima eroare, câmpul se revalidează pe măsură ce utilizatorul tastează.
form.addEventListener("input", (event) => {
  if (event.target.classList.contains("invalid")) {
    validateField(event.target);
  }
});
