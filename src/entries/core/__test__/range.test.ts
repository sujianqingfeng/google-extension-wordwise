import { test, describe, expect } from "vitest";
import { matchWordsIndices } from "../range";

describe("range", () => {
  test("", () => {
    const text = "hello word, hello world, word hello";
    const words = ["hello", "word"];
    const indices = matchWordsIndices(text, words);
    expect(indices).toMatchInlineSnapshot(`
      [
        {
          "start": 0,
          "word": "hello",
        },
        {
          "start": 6,
          "word": "word",
        },
        {
          "start": 12,
          "word": "hello",
        },
        {
          "start": 25,
          "word": "word",
        },
        {
          "start": 30,
          "word": "hello",
        },
      ]
    `);
  });
});
