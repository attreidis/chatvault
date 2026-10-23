import assert from "node:assert/strict";
import test from "node:test";
import { describeFailure } from "./safe-log";

test("failure logs keep the error name and leave out the conversation", () => {
  const err = Object.assign(new Error("insert into chats values ('secret conversation')"), {
    code: "23505",
    detail: "title = My private chat",
  });

  const summary = describeFailure(err);

  assert.equal(summary, "Error (23505)");
  assert.equal(summary.includes("secret conversation"), false);
  assert.equal(summary.includes("private chat"), false);
});

test("missing errors still produce a label", () => {
  assert.equal(describeFailure(undefined), "unknown error");
  assert.equal(describeFailure({ code: "ECONNREFUSED" }), "Error (ECONNREFUSED)");
});
