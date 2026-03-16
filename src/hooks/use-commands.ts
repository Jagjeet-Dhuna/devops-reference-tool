"use client";

import { useState, useEffect } from "react";
import { Command } from "@/lib/types";
import { fetchCommands } from "@/lib/api-client";
import { useDebounce } from "./use-debounce";

export function useCommands(options: {
  category?: string;
  search?: string;
  difficulty?: string;
  os?: string;
}) {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(options.search, 300);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchCommands({
      category: options.category,
      search: debouncedSearch,
      difficulty: options.difficulty,
      os: options.os,
    })
      .then((data) => {
        if (!cancelled) {
          setCommands(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [options.category, debouncedSearch, options.difficulty, options.os]);

  return { commands, loading, error };
}
