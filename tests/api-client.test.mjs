import assert from "node:assert/strict";
import test from "node:test";
import axios, { AxiosError } from "axios";
import { ApiError, createApiClient } from "../app/api/client.ts";

const response = (config, data, status = 200) => ({ config, data, status, statusText: "", headers: {} });
const reject = (config, status, data) => Promise.reject(new AxiosError("HTTP error", "ERR_BAD_RESPONSE", config, undefined, response(config, data, status)));

test("Laravel base URL, encoded search and array filters, JSON headers", async () => {
  let seen;
  const api = createApiClient({ baseURL: "http://localhost:8000/api/", adapter: async (config) => {
    seen = config;
    return response(config, { data: [] });
  }});
  await api.get("/job", { params: { keyword: "C++ & PHP", levels: ["Junior", "Senior"] } });
  const url = new URL(axios.getUri(seen));
  assert.equal(url.pathname, "/api/job");
  assert.equal(url.searchParams.get("keyword"), "C++ & PHP");
  assert.deepEqual(url.searchParams.getAll("levels[]"), ["Junior", "Senior"]);
  assert.equal(seen.headers.get("Accept"), "application/json");
  assert.equal(seen.withCredentials, false);
});

test("first request uses current token; logout removes it from the next request", async () => {
  let token = "first-token";
  const headers = [];
  const api = createApiClient({ baseURL: "http://localhost:8000/api", getToken: () => token, adapter: async config => {
    headers.push(config.headers.get("Authorization"));
    return response(config, { data: {} });
  }});
  await api.get("/auth/account");
  token = "second-token";
  await api.get("/auth/account");
  token = null;
  await api.get("/job");
  assert.deepEqual(headers, ["Bearer first-token", "Bearer second-token", undefined]);
});

test("401 clears the current session once and never requests a refresh endpoint", async () => {
  let calls = 0, expired = 0;
  const api = createApiClient({ baseURL: "http://localhost:8000/api", getToken: () => "expired", onUnauthorized: () => expired++, adapter: config => {
    calls++;
    return reject(config, 401, { message: "Unauthenticated." });
  }});
  await assert.rejects(api.get("/auth/account"), error => error instanceof ApiError && error.status === 401);
  assert.equal(expired, 1);
  assert.equal(calls, 1);
});

test("a late 401 cannot log out a newer session; anonymous login failure does not expire a session", async () => {
  let token = "old", expired = 0;
  const api = createApiClient({ baseURL: "http://localhost:8000/api", getToken: () => token, onUnauthorized: () => expired++, adapter: config => {
    token = "new";
    return reject(config, 401, { message: "Unauthenticated." });
  }});
  await assert.rejects(api.get("/auth/account"));
  token = null;
  await assert.rejects(api.post("/auth/login", {}));
  assert.equal(expired, 0);
});

test("Laravel 422 preserves field errors and rejects instead of triggering success", async () => {
  const errors = { email: ["Email đã được sử dụng."] };
  const api = createApiClient({ baseURL: "http://localhost:8000/api", adapter: config => reject(config, 422, { message: "Validation failed", errors }) });
  await assert.rejects(api.post("/auth/register", {}), error => {
    assert.equal(error.status, 422);
    assert.equal(error.message, errors.email[0]);
    assert.deepEqual(error.errors, errors);
    return true;
  });
});

test("500 and network errors reject", async () => {
  const api = createApiClient({ baseURL: "http://localhost:8000/api", adapter: config => reject(config, 500, "Server error") });
  await assert.rejects(api.get("/job"), error => error.status === 500);
  const offline = createApiClient({ baseURL: "http://localhost:8000/api", adapter: config => Promise.reject(new AxiosError("Network Error", "ERR_NETWORK", config)) });
  await assert.rejects(offline.get("/job"), error => error.status === 0 && error.message.includes("kết nối"));
});

test("success envelope, resource wrapper, pagination and 204 preserve UI contract", async () => {
  const payload = { isSuccess: true, message: "OK", data: { data: [{ id: 1 }], pagination: { page: 1, totalItems: 1, totalPages: 1, limit: 10 } } };
  const bodies = [payload, { data: { id: 2 } }, undefined];
  const api = createApiClient({ baseURL: "http://localhost:8000/api", adapter: async config => response(config, bodies.shift()) });
  assert.deepEqual(await api.get("/job"), payload);
  assert.deepEqual((await api.get("/auth/account")).data, { id: 2 });
  assert.equal((await api.delete("/job/1")).data, null);
});

test("multipart PATCH/PUT uses Laravel method override without mutating caller FormData", async () => {
  const seen = [];
  const api = createApiClient({ baseURL: "http://localhost:8000/api", adapter: async config => {
    seen.push(config);
    return response(config, { data: {} });
  }});
  const form = new FormData();
  form.append("avatar", new Blob(["image"], { type: "image/png" }), "avatar.png");
  form.append("username", "Nguyen");
  await api.patch("/applicant/contact", form);
  await api.put("/company/1", form);
  assert.deepEqual(seen.map(config => config.method), ["post", "post"]);
  assert.deepEqual(seen.map(config => config.data.get("_method")), ["PATCH", "PUT"]);
  assert.equal(seen[0].data.get("avatar").name, "avatar.png");
  assert.equal(form.has("_method"), false);
});

test("JSON PATCH keeps PATCH and JSON body", async () => {
  const api = createApiClient({ baseURL: "http://localhost:8000/api", adapter: async config => {
    assert.equal(config.method, "patch");
    assert.equal(JSON.parse(config.data).aboutMe, "Hello");
    return response(config, { data: "Hello" });
  }});
  await api.patch("/applicant/about-me", { aboutMe: "Hello" });
});
