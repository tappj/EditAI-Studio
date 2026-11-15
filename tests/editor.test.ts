import test from "node:test";
import assert from "node:assert/strict";
import {
  newDocument,
  newSegment,
  duration,
  split,
  captions,
  textTiming,
  applyCuts,
  duplicate,
  applyOperations,
  validate,
} from "../lib/editor/model.ts";
function fixture() {
  const d = newDocument();
  d.sources = [
    {
      id: crypto.randomUUID(),
      name: "source.mp4",
      duration: 10,
      width: 320,
      height: 180,
      kind: "video",
      mime: "video/mp4",
    },
  ];
  d.segments = [newSegment(0, 10)];
  d.words = [
    { id: "0:0", clip: 0, start: 0.2, end: 0.7, text: "Hello" },
    { id: "0:1", clip: 0, start: 0.8, end: 1.2, text: "world." },
    { id: "0:2", clip: 0, start: 5, end: 5.4, text: "Another" },
    { id: "0:3", clip: 0, start: 5.5, end: 6, text: "take." },
  ];
  return d;
}
test("split preserves source anchors and exact duration at non-unit speed", () => {
  let d = fixture();
  d.segments[0].speed = 2;
  d = captions(d);
  const out = split(d, d.segments[0].id, 5.2);
  assert.equal(duration(out), 5);
  assert.equal(out.segments.length, 2);
  assert.ok(out.texts.every((t) => textTiming(out, t).start >= 0));
});
test("cuts and duplicates keep captions on each retained source island", () => {
  const d = captions(fixture());
  const out = applyCuts(d, [{ clip: 0, start: 2, end: 4 }]);
  assert.equal(out.segments.length, 2);
  assert.equal(out.texts.length, 2);
  assert.ok(out.texts.every((t) => textTiming(out, t).start >= 0));
  const dup = duplicate(out, out.segments[1].id);
  assert.equal(dup.texts.length, 3);
  assert.equal(duration(dup), 14);
});
test("AI operations obey actual iOS target/value/text contract atomically", () => {
  const d = fixture();
  const out = applyOperations(d, [
    { kind: "speed", target: d.segments[0].id, value: 2 },
    { kind: "canvas", text: "portrait" },
    { kind: "filter", target: null, text: "Warm" },
  ]);
  assert.equal(duration(out), 5);
  assert.equal(out.canvas, "9:16");
  assert.equal(out.segments[0].appearance.filter, "Warm");
  assert.equal(d.segments[0].speed, 1);
  assert.throws(() =>
    applyOperations(d, [{ kind: "speed", target: null, value: 100 }]),
  );
});
test("safety rejects final-clip deletion, unsafe crop and overlapping audio", () => {
  const d = fixture();
  assert.throws(() =>
    applyOperations(d, [{ kind: "delete", target: d.segments[0].id }]),
  );
  const c = structuredClone(d);
  c.segments[0].appearance.crop.x = 0.8;
  c.segments[0].appearance.crop.width = 0.5;
  assert.throws(() => validate(c));
  d.audio = [
    {
      id: "a",
      sourceIndex: 0,
      start: 0,
      end: 3,
      sourceStart: 0,
      lane: 0,
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
    },
    {
      id: "b",
      sourceIndex: 0,
      start: 2,
      end: 5,
      sourceStart: 0,
      lane: 0,
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
    },
  ];
  assert.throws(() => validate(d));
});
test("speed edits project source-attached captions instead of leaving stale timestamps", () => {
  let d = captions(fixture());
  d.segments[0].speed = 2;
  const a = textTiming(d, d.texts[1]);
  assert.ok(a.start > 2.4 && a.start < 2.6);
  assert.ok(a.end <= 3.1);
});
