// Minimal glob -> RegExp. Supports **, *, ? and plain path segments.
// Matching is against repo-relative POSIX paths.
export function globToRegExp(glob: string): RegExp {
  let re = "";
  let i = 0;
  const g = glob.replace(/\\/g, "/");
  while (i < g.length) {
    const ch = g[i];
    if (ch === "*") {
      if (g[i + 1] === "*") {
        // **/ or ** at end → cross directories
        if (g[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 3;
        } else {
          re += ".*";
          i += 2;
        }
      } else {
        re += "[^/]*";
        i += 1;
      }
    } else if (ch === "?") {
      re += "[^/]";
      i += 1;
    } else {
      re += ch.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      i += 1;
    }
  }
  return new RegExp(`^${re}$`);
}

export function matchGlob(path: string, glob: string): boolean {
  return globToRegExp(glob).test(path.replace(/\\/g, "/"));
}
