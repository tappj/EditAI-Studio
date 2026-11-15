"use client";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "./ui";
export function Batch({
  onDone,
}: {
  onDone: (groups: File[][], useAI: boolean) => void;
}) {
  const [useAI, setUseAI] = useState(true);
  const [groups, setGroups] = useState<File[][]>(
    Array.from({ length: 7 }, () => []),
  );
  return (
    <main className="dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ONE FLOW. MORE POSSIBILITIES.</p>
          <h1>Create in batches.</h1>
          <p>
            Each box becomes its own editable project. Select clips for at least
            two.
          </p>
        </div>
      </div>
      <div className="batch-grid">
        {groups.map((g, i) => (
          <label className="batch-box" key={i}>
            <span>VIDEO {String(i + 1).padStart(2, "0")}</span>
            <Plus size={25} />
            <strong>
              {g.length ? g.map((f) => f.name).join(", ") : "Choose clips"}
            </strong>
            <input
              type="file"
              accept="video/*"
              multiple
              hidden
              onChange={(e) =>
                setGroups((gs) =>
                  gs.map((x, j) =>
                    j === i ? Array.from(e.target.files || []) : x,
                  ),
                )
              }
            />
          </label>
        ))}
        {groups.length < 10 && (
          <button
            className="batch-box"
            onClick={() => setGroups((g) => [...g, []])}
          >
            <Plus />
            Add another video
          </button>
        )}
      </div>
      <label className="checkbox batch-ai">
        <input
          type="checkbox"
          checked={useAI}
          onChange={(e) => setUseAI(e.target.checked)}
        />
        Run AI editing for each project (uses your connected AI plan or key)
      </label>
      <Button
        disabled={groups.filter((g) => g.length).length < 2}
        onClick={() =>
          void onDone(
            groups.filter((g) => g.length),
            useAI,
          )
        }
      >
        Create {groups.filter((g) => g.length).length} projects{" "}
        <ArrowRight size={17} />
      </Button>
    </main>
  );
}
