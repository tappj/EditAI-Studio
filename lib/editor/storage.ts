import { openDB } from "idb";
import type { Project } from "./model";
let scope = "signed-out";
export function setStorageScope(owner: string) {
  scope = owner;
}
const db = () =>
  openDB("editai-studio", 1, {
    upgrade(d) {
      d.createObjectStore("projects", { keyPath: "id" });
      d.createObjectStore("media");
      d.createObjectStore("preferences");
    },
  });
export const saveMedia = async (id: string, file: Blob) => {
  await (await db()).put("media", file, scope + ":" + id);
};
export const loadMedia = async (id: string): Promise<Blob | undefined> =>
  (await db()).get("media", scope + ":" + id);
export const saveProject = async (p: Project) => {
  await (await db()).put("projects", { ...p, _owner: scope });
};
export const listProjects = async (): Promise<Project[]> =>
  ((await (await db()).getAll("projects")) as (Project & { _owner?: string })[])
    .filter((p) => p._owner === scope)
    .sort((a, b) => b.updatedAt - a.updatedAt);
export const deleteProject = async (id: string) => {
  const d = await db(),
    p = await d.get("projects", id);
  if (p?._owner !== scope) return;
  await d.delete("projects", id);
  const used = new Set(
    (await listProjects()).flatMap((p) => p.document.sources.map((s) => s.id)),
  );
  for (const s of p.document.sources)
    if (!used.has(s.id)) await d.delete("media", scope + ":" + s.id);
};
export const clearStorage = async () => {
  const d = await db();
  for (const k of await d.getAllKeys("media"))
    if (String(k).startsWith(scope + ":")) await d.delete("media", k);
  for (const p of await listProjects()) await d.delete("projects", p.id);
};
