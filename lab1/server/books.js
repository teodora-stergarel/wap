import { Router } from "express";
import { pool } from "./db.js";

const router = Router();
const COLUMNS = "id, title, author, year";

// Întoarce { book } cu valorile curățate sau { errors } cu un mesaj pe câmp.
function validateBook(body) {
  const errors = {};
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const author = typeof body?.author === "string" ? body.author.trim() : "";
  const year = body?.year ?? null;

  if (title.length < 2) errors.title = "Titlul trebuie să aibă cel puțin 2 caractere.";
  if (author === "") errors.author = "Autorul este obligatoriu.";

  const currentYear = new Date().getFullYear();
  if (year !== null && (!Number.isInteger(year) || year < 1000 || year > currentYear)) {
    errors.year = `Anul trebuie să fie un număr întreg între 1000 și ${currentYear}.`;
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { book: { title, author, year } };
}

// Validează :id o singură dată pentru toate rutele care îl folosesc.
router.param("id", (req, res, next, value) => {
  if (!/^\d{1,9}$/.test(value)) {
    return res.status(400).json({ error: "Id-ul trebuie să fie un număr întreg pozitiv." });
  }
  req.bookId = Number(value);
  next();
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM books ORDER BY id`);
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM books WHERE id = $1`, [req.bookId]);
  if (rows.length === 0) return res.status(404).json({ error: "Cartea nu există." });
  res.json(rows[0]);
});

router.post("/", async (req, res) => {
  const { book, errors } = validateBook(req.body);
  if (errors) return res.status(400).json({ error: "Date invalide.", errors });

  const { rows } = await pool.query(
    `INSERT INTO books (title, author, year) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
    [book.title, book.author, book.year]
  );
  res.status(201).location(`/api/books/${rows[0].id}`).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const { book, errors } = validateBook(req.body);
  if (errors) return res.status(400).json({ error: "Date invalide.", errors });

  const { rows } = await pool.query(
    `UPDATE books SET title = $1, author = $2, year = $3 WHERE id = $4 RETURNING ${COLUMNS}`,
    [book.title, book.author, book.year, req.bookId]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Cartea nu există." });
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM books WHERE id = $1", [req.bookId]);
  if (rowCount === 0) return res.status(404).json({ error: "Cartea nu există." });
  res.status(204).end();
});

export default router;
