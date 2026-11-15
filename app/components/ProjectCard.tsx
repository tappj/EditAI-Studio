"use client";
import { Film, Trash2 } from "lucide-react";
import { IconButton } from "./ui";
import { duration, type Project } from "@/lib/editor/model";
import { formatTime as time } from "@/lib/editor/time";
export function ProjectCard({
  p,
  open,
  remove,
}: {
  p: Project;
  open: () => void;
  remove: () => void;
}) {
  return (
    <article className="project-card">
      <button className="project-preview" onClick={open}>
        <Film size={38} />
        <span>{time(duration(p.document))}</span>
      </button>
      <div>
        <button className="project-card-title" onClick={open}>
          {p.title}
        </button>
        <small>
          {p.document.segments.length} clips ·{" "}
          {new Date(p.updatedAt).toLocaleDateString()}
        </small>
        <IconButton label={"Delete " + p.title} onClick={remove}>
          <Trash2 size={15} />
        </IconButton>
      </div>
    </article>
  );
}
