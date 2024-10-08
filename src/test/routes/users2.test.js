const request = require("supertest");
const buildApp = require("../../app");
const UserRepo = require("../../repos/users-repo");
const Context = require("../context");

let context;
beforeAll(async () => {
  context = await Context.build();
});

beforeEach(async () => {
  await context.reset();
});

afterAll(() => {
  return context.close();
});

test("create a user #02", async () => {
  const startingCount = await UserRepo.count();

  await request(buildApp())
    .post("/users")
    .send({ username: "testuser", bio: "This is bio" })
    .expect(200);

  const finishCount = await UserRepo.count();
  expect(finishCount - startingCount).toBe(1);
});
