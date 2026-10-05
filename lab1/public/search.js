const SEARCH_URL = "https://openlibrary.org/search.json";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchStatus = document.getElementById("search-status");
const searchResults = document.getElementById("search-results");

// Ține minte cererea în curs, ca o căutare nouă să o poată anula pe cea veche.
let activeRequest = null;

function setStatus(message, type = "") {
  searchStatus.textContent = message;
  searchStatus.className = `status ${type}`.trim();
  searchStatus.hidden = message === "";
}

async function searchBooks(title, signal) {
  const params = new URLSearchParams({
    title,
    limit: "10",
    fields: "key,title,author_name,first_publish_year",
  });
  const response = await fetch(`${SEARCH_URL}?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Open Library a răspuns cu statusul ${response.status}`);
  }
  const data = await response.json();
  return data.docs.map((doc) => ({
    title: doc.title,
    author: doc.author_name ? doc.author_name.join(", ") : "Autor necunoscut",
    year: doc.first_publish_year ?? null,
  }));
}

function renderResults(books) {
  searchResults.replaceChildren();
  for (const book of books) {
    const item = document.createElement("li");

    const title = document.createElement("span");
    title.className = "book-title";
    title.textContent = book.title;

    const meta = document.createElement("span");
    meta.className = "book-meta";
    meta.textContent = `${book.author}, ${book.year ?? "an necunoscut"}`;

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Adaugă în lista mea";
    addButton.addEventListener("click", async () => {
      addButton.disabled = true;
      try {
        addBookToList(await createBook(book));
        addButton.textContent = "Adăugată";
      } catch (error) {
        addButton.disabled = false;
        setStatus(`Cartea nu a putut fi adăugată: ${error.message}`, "error-status");
      }
    });

    item.append(title, meta, addButton);
    searchResults.append(item);
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = searchInput.value.trim();
  if (title === "") {
    searchResults.replaceChildren();
    setStatus("Scrie un titlu pentru a căuta.", "error-status");
    return;
  }

  if (activeRequest) activeRequest.abort();
  const controller = new AbortController();
  activeRequest = controller;

  searchResults.replaceChildren();
  setStatus("Se încarcă...", "loading");
  searchButton.disabled = true;

  try {
    const books = await searchBooks(title, controller.signal);
    if (books.length === 0) {
      setStatus(`Nu am găsit nicio carte cu titlul „${title}”.`);
    } else {
      setStatus(`${books.length} rezultate pentru „${title}”.`);
      renderResults(books);
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    console.error(error);
    setStatus("A apărut o eroare la căutare. Verifică conexiunea și încearcă din nou.", "error-status");
  } finally {
    if (activeRequest === controller) {
      activeRequest = null;
      searchButton.disabled = false;
    }
  }
});
