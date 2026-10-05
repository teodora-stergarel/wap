# WAP – Laboratoare

Laboratoarele de la materia WAP. Fiecare laborator are folderul lui.

## Laborator 1 – Cărțile mele

O aplicație web mică, construită în trepte:

1. **Front-end static** – pagină HTML/CSS responsive cu detalii personale și un formular de adăugare validat în JavaScript.
2. **Consum de API** – căutare de cărți după titlu prin [Open Library API](https://openlibrary.org/dev/docs/api/search), cu indicator de încărcare și mesaje de eroare.
3. **Backend REST** – API CRUD propriu în Express, cu PostgreSQL, apelat din front-end.
4. **Git** – codul pe GitHub, cu un commit pe treaptă.

### Structură

```
lab1/
├── docker-compose.yml   # baza de date PostgreSQL
├── public/              # front-end (HTML, CSS, JavaScript)
└── server/              # API-ul Express
    ├── index.js         # pornirea serverului și tratarea erorilor
    ├── books.js         # rutele /api/books
    └── db.js            # conexiunea la baza de date și crearea tabelei
```

### Cerințe

- [Node.js](https://nodejs.org/) 20.11 sau mai nou
- [Docker](https://www.docker.com/products/docker-desktop/) (pentru PostgreSQL)

### Pași de rulare

1. Clonează repo-ul și intră în folderul laboratorului:

   ```bash
   git clone git@github.com:teodora-stergarel/wap.git
   cd wap/lab1
   ```

2. Pornește baza de date:

   ```bash
   docker compose up -d
   ```

3. Instalează dependențele și creează fișierul de configurare:

   ```bash
   cd server
   npm install
   cp .env.example .env
   ```

4. Pornește serverul:

   ```bash
   npm start
   ```

5. Deschide <http://localhost:3000> în browser.

Tabela `books` se creează singură la prima pornire. Pentru dezvoltare, `npm run dev` repornește serverul la fiecare modificare.

Pentru oprire: `Ctrl+C` în terminalul serverului, apoi `docker compose down` în `lab1/` (adaugă `-v` ca să ștergi și datele).

### Configurare

Valorile din `server/.env`:

| Variabilă | Implicit | Rol |
|---|---|---|
| `DATABASE_URL` | `postgres://wap:wap_dev_password@localhost:5432/wap_lab1` | conexiunea la PostgreSQL |
| `PORT` | `3000` | portul serverului |

Utilizatorul și parola din `.env.example` sunt cele din `docker-compose.yml` și sunt doar pentru dezvoltare locală.

### API

O carte are forma `{ "id": 1, "title": "Ion", "author": "Liviu Rebreanu", "year": 1920 }`. Câmpul `year` poate fi `null`.

| Metodă | Rută | Descriere | Răspuns | Erori |
|---|---|---|---|---|
| `GET` | `/api/books` | toate cărțile | `200` | – |
| `GET` | `/api/books/:id` | o carte | `200` | `400`, `404` |
| `POST` | `/api/books` | adaugă o carte | `201` | `400` |
| `PUT` | `/api/books/:id` | modifică o carte | `200` | `400`, `404` |
| `DELETE` | `/api/books/:id` | șterge o carte | `204` | `400`, `404` |

Erorile au forma `{ "error": "mesaj" }`. La date invalide (`400`) răspunsul conține și `errors`, cu un mesaj pentru fiecare câmp greșit.

Exemplu:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Ion", "author": "Liviu Rebreanu", "year": 1920}'
```
