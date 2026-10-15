# Address Book API

SE4458 – Assignment 2 (Group 1 – Address Book)

A simple REST API to create, read, update, delete, search, sort and favorite contacts. Data is stored in an in-memory database and the API is documented with Swagger UI.

## Links

- **Source code:** https://github.com/enesertas1/address-book-api
- **Live Swagger UI:** https://address-book-api-xxxx.vercel.app/api-docs

## Tech Stack

Node.js, Express, swagger-ui-express (OpenAPI 3.0), in-memory storage, deployed on Vercel.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/contacts` | List contacts (supports `q`, `tag`, `favorite`, `sortBy`, `order`, `page`, `limit`) |
| GET | `/contacts/{id}` | Get a single contact |
| POST | `/contacts` | Create a contact |
| PUT | `/contacts/{id}` | Update a contact (full) |
| PATCH | `/contacts/{id}` | Update a contact (partial) |
| PATCH | `/contacts/{id}/favorite` | Toggle favorite |
| DELETE | `/contacts/{id}` | Delete a contact |

**Contact model:**

```json
{
  "id": 1,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan.turing@auning.com",
  "phone": "+1 555 123 4567",
  "tags": ["Work"],
  "favorite": true
}
```

## Run Locally

```bash
git clone https://github.com/KULLANICI_ADIN/address-book-api.git
cd address-book-api
npm install
npm start
```

Then open http://localhost:3000/api-docs

## Design

- Single Express app in `api/index.js`, exported so Vercel can run it as a serverless function. Locally the same file starts a normal server.
- Contacts are stored in an in-memory array seeded with four sample contacts. IDs come from an incrementing counter.
- `GET /contacts` applies search, filter, sort and pagination, and returns `total`, `page` and `limit` along with the data.
- The OpenAPI spec is written in `api/swagger.js` and served with Swagger UI at `/api-docs`.
- Standard status codes: 201 on create, 204 on delete, 400 for validation errors, 404 when a contact is not found.

## Assumptions

- Only the API and Swagger are needed, no frontend.
- Persistence is not required, so in-memory storage is enough.
- `firstName` and `lastName` are required; email, phone and tags are optional. Email format is validated if given.
- Tags are free-form strings such as `Work`, `Family`, `Phone`.
- Search covers name, email and tags, like the search box in the UI mockup.
- No authentication.

## Issues Encountered

- **In-memory data resets on Vercel.** Serverless functions restart and do not share memory, so contacts return to the seed data after a cold start. This is acceptable for this assignment, which asks for an in-memory database.
- **Routing on Vercel.** By default Vercel only runs `api/index.js` for requests under `/api`, so paths like `/`, `/contacts` and `/api-docs` would return 404. Resolved with a `vercel.json` rewrite that sends all requests to the Express app.