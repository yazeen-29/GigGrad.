const { test } = require("node:test");
const assert = require("node:assert/strict");
const { text, transition, canPost } = require("../src/lib/validation");
test("faculty and staff post directly while students need approval", () => {
  assert.equal(canPost({ role: "TEACHER", posterStatus: "none" }), true);
  assert.equal(canPost({ role: "STUDENT", posterStatus: "approved" }), true);
  assert.equal(canPost({ role: "ADMIN" }), true);
  assert.equal(canPost({ role: "STUDENT", posterStatus: "none" }), false);
  assert.equal(canPost({ role: "STUDENT", posterStatus: "pending" }), false);
});
test("only the assigned worker submits and only the owner approves", () => {
  const job = {
    postedById: "poster",
    assignedToId: "worker",
    status: "IN_PROGRESS",
  };
  assert.equal(transition(job, "worker", "PENDING_APPROVAL"), true);
  assert.equal(transition(job, "worker", "COMPLETED"), false);
  assert.equal(transition(job, "poster", "COMPLETED"), false);
  assert.equal(
    transition({ ...job, status: "PENDING_APPROVAL" }, "poster", "COMPLETED"),
    true,
  );
  assert.equal(
    transition({ ...job, status: "DISPUTED" }, "poster", "COMPLETED"),
    false,
  );
  assert.equal(
    transition({ ...job, status: "COMPLETED" }, "worker", "OPEN"),
    false,
  );
});
test("input validation rejects objects, empty values and oversized text", () => {
  for (const input of [null, {}, [], "", "    ", "a".repeat(201)])
    assert.throws(() => text(input, "Value"));
  assert.equal(text(" hello ", "Value"), "hello");
});
