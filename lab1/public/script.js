const API_URL = "/api/books";

const form = document.getElementById("book-form");
const formTitle = document.getElementById("form-title");
const formError = document.getElementById("form-error");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const bookList = document.getElementById("book-list");
const booksStatus = document.getElementById("books-status");

const currentYear = new Date().getFullYear();

// Id-ul cărții aflate în editare; null înseamnă că formularul adaugă o carte nouă.
let editingId = null;

// Fiecare validator întoarce mesajul de eroare sau "" dacă valoarea e validă.
const validators = {
  title(value) {
    if (value === "") return "Titlul este obligatoriu.";
    if (value.length < 2) return "Titlul trebuie să aibă cel puțin 2 caractere.";
    return "";
  },
  author(value) {
    if (value === "") return "Autorul este obligatoriu.";
    if (!/^[\p{L}][\p{L} .,'-]+$/u.test(value)) {
      return "Autorul poate conține doar litere, spații, punct, virgulă și cratimă.";
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

function setFieldError(input, message) {
  document.getElementById(`${input.name}-error`).textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.setAttribute("aria-invalid", String(message !== ""));
}

function validateField(input) {
  const message = validators[input.name](input.value.trim());
  setFieldError(input, message);
  return message === "";
}

// Trimite o cerere către API și aruncă o eroare cu mesajul serverului dacă statusul nu e 2xx.
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error ?? `Cererea a eșuat cu statusul ${response.status}.`);
    error.fieldErrors = data?.errors ?? {};
    throw error;
  }
  return data;
}

function createBook(book) {
  return request(API_URL, { method: "POST", body: JSON.stringify(book) });
}

function updateBook(id, book) {
  return request(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(book) });
}

function deleteBook(id) {
  return request(`${API_URL}/${id}`, { method: "DELETE" });
}

function setBooksStatus(message, isError = false) {
  booksStatus.textContent = message;
  booksStatus.classList.toggle("error-status", isError);
  booksStatus.hidden = message === "";
}

function updateEmptyState() {
  setBooksStatus(bookList.children.length === 0 ? "Nu ai adăugat nicio carte încă." : "");
}

function renderBook(book) {
  const item = document.createElement("li");
  item.dataset.id = book.id;

  const title = document.createElement("span");
  title.className = "book-title";
  title.textContent = book.title;

  const meta = document.createElement("span");
  meta.className = "book-meta";
  meta.textContent = `${book.author}, ${book.year ?? "an necunoscut"}`;

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "secondary";
  editButton.textContent = "Editează";
  editButton.addEventListener("click", () => startEditing(book));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger";
  deleteButton.textContent = "Șterge";
  deleteButton.addEventListener("click", async () => {
    deleteButton.disabled = true;
    try {
      await deleteBook(book.id);
      if (editingId === book.id) stopEditing();
      item.remove();
      updateEmptyState();
    } catch (error) {
      deleteButton.disabled = false;
      setBooksStatus(`Cartea nu a putut fi ștearsă: ${error.message}`, true);
    }
  });

  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(editButton, deleteButton);

  item.append(title, meta, actions);
  return item;
}

function addBookToList(book) {
  bookList.append(renderBook(book));
  updateEmptyState();
}

function startEditing(book) {
  editingId = book.id;
  form.title.value = book.title;
  form.author.value = book.author;
  form.year.value = book.year ?? "";
  [form.title, form.author, form.year].forEach((input) => setFieldError(input, ""));
  formError.textContent = "";
  formTitle.textContent = "Editează cartea";
  submitButton.textContent = "Salvează";
  cancelButton.hidden = false;
  form.title.focus();
}

function stopEditing() {
  editingId = null;
  form.reset();
  formError.textContent = "";
  formTitle.textContent = "Adaugă o carte";
  submitButton.textContent = "Adaugă";
  cancelButton.hidden = true;
}

async function loadBooks() {
  setBooksStatus("Se încarcă...");
  try {
    const books = await request(API_URL);
    bookList.replaceChildren(...books.map(renderBook));
    updateEmptyState();
  } catch (error) {
    setBooksStatus(`Cărțile nu au putut fi încărcate: ${error.message}`, true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const inputs = [form.title, form.author, form.year];
  const invalid = inputs.filter((input) => !validateField(input));
  if (invalid.length > 0) {
    invalid[0].focus();
    return;
  }

  const book = {
    title: form.title.value.trim(),
    author: form.author.value.trim(),
    year: Number(form.year.value.trim()),
  };

  formError.textContent = "";
  submitButton.disabled = true;
  try {
    if (editingId === null) {
      addBookToList(await createBook(book));
    } else {
      const saved = await updateBook(editingId, book);
      bookList.querySelector(`[data-id="${saved.id}"]`).replaceWith(renderBook(saved));
    }
    stopEditing();
    form.title.focus();
  } catch (error) {
    // Erorile de validare de pe server apar sub câmpul lor, restul sub formular.
    for (const input of inputs) {
      if (error.fieldErrors?.[input.name]) setFieldError(input, error.fieldErrors[input.name]);
    }
    formError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

// După prima eroare, câmpul se revalidează pe măsură ce utilizatorul tastează.
form.addEventListener("input", (event) => {
  if (event.target.classList.contains("invalid")) {
    validateField(event.target);
  }
});

cancelButton.addEventListener("click", stopEditing);

loadBooks();
