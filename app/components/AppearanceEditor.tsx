"use client";
import { type Appearance, appearance, filters } from "@/lib/editor/model";
import { ADVANCED_ADJUSTMENTS, POSITIVE_ADJUSTMENTS } from "@/lib/editor/color";
import { Button, Range } from "./ui";
export function AppearanceEditor({
  value,
  onChange,
}: {
  value: Appearance;
  onChange: (value: Appearance) => void;
}) {
  const edit = (fn: (v: Appearance) => void) => {
    const next = structuredClone(value);
    fn(next);
    onChange(next);
  };
  return (
    <>
      {" "}
      <div className="panel-divider" />
      <h3>Look & feel</h3>
      <div className="filter-grid">
        {filters.map((f) => (
          <button
            key={f}
            className={value.filter === f ? "selected" : ""}
            onClick={() =>
              edit((s) => {
                s.filter = f;
              })
            }
          >
            {f}
          </button>
        ))}
      </div>
      <Range
        label="Brightness"
        min={-0.8}
        max={0.8}
        value={value.brightness}
        onChange={(n) =>
          edit((s) => {
            s.brightness = n;
          })
        }
      />
      <Range
        label="Contrast"
        min={0.2}
        max={2}
        value={value.contrast}
        onChange={(n) =>
          edit((s) => {
            s.contrast = n;
          })
        }
      />
      <Range
        label="Saturation"
        min={0}
        max={2}
        value={value.saturation}
        onChange={(n) =>
          edit((s) => {
            s.saturation = n;
          })
        }
      />
      <div className="panel-divider" />
      <details className="advanced-adjustments">
        <summary>More adjustments</summary>
        {ADVANCED_ADJUSTMENTS.map((name) => (
          <Range
            key={name}
            label={name}
            min={POSITIVE_ADJUSTMENTS.has(name) ? 0 : -1}
            max={1}
            value={value.adjustments?.[name] || 0}
            onChange={(n) =>
              edit((s) => {
                s.adjustments ??= {};
                s.adjustments[name] = n;
              })
            }
          />
        ))}
      </details>
      <div className="panel-divider" />
      <h3>Crop & transform</h3>
      <div className="button-row">
        <button
          onClick={() =>
            edit((s) => {
              s.rotation = (s.rotation + 1) % 4;
            })
          }
        >
          Rotate 90°
        </button>
        <button
          onClick={() =>
            edit((s) => {
              s.flipX = !s.flipX;
            })
          }
        >
          Flip ↔
        </button>
        <button
          onClick={() =>
            edit((s) => {
              s.flipY = !s.flipY;
            })
          }
        >
          Flip ↕
        </button>
      </div>
      {[
        ["X", "x", 0, 0.9],
        ["Y", "y", 0, 0.9],
        ["Width", "width", 0.1, 1],
        ["Height", "height", 0.1, 1],
      ].map(([label, key, min, max]) => (
        <Range
          key={String(key)}
          label={String(label)}
          value={(value.crop as any)[key]}
          min={Number(min)}
          max={Number(max)}
          onChange={(n) =>
            edit((s) => {
              const c = s.crop;
              (c as any)[key] = n;
              c.width = Math.min(c.width, 1 - c.x);
              c.height = Math.min(c.height, 1 - c.y);
            })
          }
        />
      ))}
      <Button
        secondary
        onClick={() =>
          edit((s) => {
            const crop = s.crop,
              rotation = s.rotation,
              flipX = s.flipX,
              flipY = s.flipY,
              opacity = s.opacity;
            Object.assign(s, appearance(), {
              crop,
              rotation,
              flipX,
              flipY,
              opacity,
            });
          })
        }
      >
        Reset look & color
      </Button>
      <Button
        secondary
        onClick={() =>
          edit((s) => {
            s.crop = { x: 0, y: 0, width: 1, height: 1 };
            s.rotation = 0;
            s.flipX = false;
            s.flipY = false;
          })
        }
      >
        Reset crop & transform
      </Button>
    </>
  );
}
