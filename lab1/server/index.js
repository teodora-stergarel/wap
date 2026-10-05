import path from "node:path";
import express from "express";
import { initDb } from "./db.js";
import booksRouter from "./books.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, "..", "public")));
app.use("/api/books", booksRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta nu există." });
});

// Express 5 trimite aici și erorile aruncate din handlerele async.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Corpul cererii nu este JSON valid." });
  }
  console.error(err);
  res.status(500).json({ error: "Eroare internă de server." });
});

try {
  await initDb();
} catch (err) {
  console.error("Nu m-am putut conecta la baza de date. Rulează `docker compose up -d` în lab1/.");
  console.error(err.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
