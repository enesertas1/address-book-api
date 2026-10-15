const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
app.use(express.json());

// ---- In-memory database ----
let contacts = [
  { id: 1, firstName: "Alan", lastName: "Turing", email: "alan.turing@auning.com", phone: "+1 555 123 4567", tags: ["Work"], favorite: true },
  { id: 2, firstName: "Marie", lastName: "Curie", email: "marie.curie@mail.com", phone: "+33 1 2345 6789", tags: ["Family"], favorite: false },
  { id: 3, firstName: "Katherine", lastName: "Johnson", email: "katherine.johnson@abcc.com", phone: "+1 555 987 6543", tags: ["Phone"], favorite: true },
  { id: 4, firstName: "Charles", lastName: "Darwin", email: "charles.darwin@adl.gov", phone: "+44 20 7946 0000", tags: [], favorite: false },
];
let nextId = 5;

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ---- Swagger ----
const CDN = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14";
app.get("/swagger.json", (req, res) => res.json(swaggerSpec));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: `${CDN}/swagger-ui.css`,
    customJs: [`${CDN}/swagger-ui-bundle.js`, `${CDN}/swagger-ui-standalone-preset.js`],
  })
);
app.get("/", (req, res) => res.redirect("/api-docs"));

// ---- Endpoints ----

// LIST + SEARCH + FILTER + SORT + PAGINATION
app.get("/contacts", (req, res) => {
  const { q, tag, favorite, sortBy = "firstName", order = "asc", page = 1, limit = 10 } = req.query;
  let result = [...contacts];

  if (q) {
    const s = q.toLowerCase();
    result = result.filter(
      (c) =>
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s) ||
        c.tags.some((t) => t.toLowerCase().includes(s))
    );
  }
  if (tag) result = result.filter((c) => c.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
  if (favorite !== undefined) result = result.filter((c) => c.favorite === (favorite === "true"));

  if (!["firstName", "lastName", "email"].includes(sortBy))
    return res.status(400).json({ error: "sortBy must be firstName, lastName or email" });
  result.sort((a, b) => (a[sortBy] || "").localeCompare(b[sortBy] || ""));
  if (order === "desc") result.reverse();

  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.max(parseInt(limit) || 10, 1);
  res.json({ total: result.length, page: p, limit: l, data: result.slice((p - 1) * l, p * l) });
});

// GET ONE
app.get("/contacts/:id", (req, res) => {
  const c = contacts.find((x) => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Contact not found" });
  res.json(c);
});

// CREATE
app.post("/contacts", (req, res) => {
  const { firstName, lastName, email, phone, tags = [], favorite = false } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: "firstName and lastName are required" });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
  const contact = { id: nextId++, firstName, lastName, email, phone, tags, favorite };
  contacts.push(contact);
  res.status(201).json(contact);
});

// UPDATE (full)
app.put("/contacts/:id", (req, res) => {
  const idx = contacts.findIndex((x) => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Contact not found" });
  const { firstName, lastName, email, phone, tags = [], favorite = false } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: "firstName and lastName are required" });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
  contacts[idx] = { id: contacts[idx].id, firstName, lastName, email, phone, tags, favorite };
  res.json(contacts[idx]);
});

// UPDATE (partial)
app.patch("/contacts/:id", (req, res) => {
  const c = contacts.find((x) => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Contact not found" });
  if (req.body.email && !isValidEmail(req.body.email)) return res.status(400).json({ error: "Invalid email" });
  const { firstName, lastName, email, phone, tags, favorite } = req.body;
  Object.assign(c, Object.fromEntries(Object.entries({ firstName, lastName, email, phone, tags, favorite }).filter(([, v]) => v !== undefined)));
  res.json(c);
});

// TOGGLE FAVORITE
app.patch("/contacts/:id/favorite", (req, res) => {
  const c = contacts.find((x) => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Contact not found" });
  c.favorite = !c.favorite;
  res.json(c);
});

// DELETE
app.delete("/contacts/:id", (req, res) => {
  const idx = contacts.findIndex((x) => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Contact not found" });
  contacts.splice(idx, 1);
  res.status(204).send();
});

// Local çalıştırma
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`http://localhost:${port}/api-docs`));
}

module.exports = app;