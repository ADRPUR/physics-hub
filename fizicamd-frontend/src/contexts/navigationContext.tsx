import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { NavigationItem } from "../types/navigation";
import { fetchPublicNavigation } from "../api/navigation";

export type NavigationNode = NavigationItem & {
  children: NavigationNode[];
};

type NavigationContextValue = {
  tree: NavigationNode[];
  refresh: () => Promise<void>;
};

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

function buildTree(items: NavigationItem[]): NavigationNode[] {
  const map = new Map<string, NavigationNode>();
  const roots: NavigationNode[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] as NavigationNode[] });
  });

  items.forEach((item) => {
    const node = map.get(item.id);
    if (!node) return;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortFn = (a: NavigationNode, b: NavigationNode) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  roots.sort(sortFn);
  roots.forEach((node) => node.children.sort(sortFn));
  return roots;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<NavigationNode[]>([]);

  const load = async () => {
    try {
      const data = await fetchPublicNavigation();
      setTree(buildTree(data));
    } catch (err) {
      console.error("Failed to load navigation", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      tree,
      refresh: load,
    }),
    [tree]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigationTree() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigationTree must be used inside NavigationProvider");
  }
  return ctx;
}
