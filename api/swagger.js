const contactBody = {
  type: "object",
  required: ["firstName", "lastName"],
  properties: {
    firstName: { type: "string", example: "Alan" },
    lastName: { type: "string", example: "Turing" },
    email: { type: "string", example: "alan.turing@auning.com" },
    phone: { type: "string", example: "+1 555 123 4567" },
    tags: { type: "array", items: { type: "string" }, example: ["Work"] },
    favorite: { type: "boolean", example: false },
  },
};
const idParam = { name: "id", in: "path", required: true, schema: { type: "integer" } };
const body = { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContactInput" } } } };
const ok = (d) => ({ description: d });

module.exports = {
  openapi: "3.0.0",
  info: { title: "Address Book API", version: "1.0.0", description: "SE4458 Assignment 2 - Group 1" },
  servers: [{ url: "/" }],
  components: { schemas: { ContactInput: contactBody } },
  paths: {
    "/contacts": {
      get: {
        summary: "List contacts (search, filter, sort, paginate)",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Search name, email or tag" },
          { name: "tag", in: "query", schema: { type: "string" } },
          { name: "favorite", in: "query", schema: { type: "boolean" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["firstName", "lastName", "email"], default: "firstName" } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: { 200: ok("OK") },
      },
      post: { summary: "Create contact", requestBody: body, responses: { 201: ok("Created"), 400: ok("Validation error") } },
    },
    "/contacts/{id}": {
      get: { summary: "Get contact", parameters: [idParam], responses: { 200: ok("OK"), 404: ok("Not found") } },
      put: { summary: "Update contact (full)", parameters: [idParam], requestBody: body, responses: { 200: ok("OK"), 404: ok("Not found") } },
      patch: { summary: "Update contact (partial)", parameters: [idParam], requestBody: body, responses: { 200: ok("OK"), 404: ok("Not found") } },
      delete: { summary: "Delete contact", parameters: [idParam], responses: { 204: ok("Deleted"), 404: ok("Not found") } },
    },
    "/contacts/{id}/favorite": {
      patch: { summary: "Toggle favorite", parameters: [idParam], responses: { 200: ok("OK"), 404: ok("Not found") } },
    },
  },
};