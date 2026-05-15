"use client";

import {
  Box,
  InputBase,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { IRole } from "@app/auth/lib/session";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { useAppSelector } from "@redux/hooks/hooks";
import { RootState } from "@redux/store/store";
import { AutocompleteBooksEP } from "@webEndPoints/handlers/bookWEB/bookWEB";

interface AutocompleteItem {
  book_id: number;
  title: string;
  author: string;
}

interface Props {
  role?: IRole;
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              backgroundColor: "transparent",
              color: "#1976d2",
              fontWeight: 700,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const SearchBarContent = ({ role = "GUEST" }: Props) => {
  if (role === "ADMIN" || role === "SELLER") return null;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const loading = useAppSelector((state: RootState) => state.menu.loading);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [userIsTyping, setUserIsTyping] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setSuggestions([]);
    setShowDropdown(false);
    setUserIsTyping(false);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!userIsTyping || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setSuggestLoading(true);

    AutocompleteBooksEP(debouncedQuery)
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data ?? [];
        setSuggestions(Array.isArray(data) ? data : []);
        setShowDropdown(true);
        setActiveIndex(-1);
      })
      .catch(() => {})
      .finally(() => setSuggestLoading(false));
  }, [debouncedQuery, userIsTyping]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: AutocompleteItem) => {
    setUserIsTyping(false);
    setShowDropdown(false);
    setSuggestions([]);
    setQuery(item.title);
    router.push(`/?q=${encodeURIComponent(item.title)}`);
  };

  const handleSearch = (text = query) => {
    if (!text.trim()) return;
    setUserIsTyping(false);
    setShowDropdown(false);
    setSuggestions([]);
    router.push(`/?q=${encodeURIComponent(text.trim())}`);
  };

  const handleClear = () => {
    setUserIsTyping(false);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    if (pathname === "/") {
      router.push("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      activeIndex >= 0
        ? handleSelect(suggestions[activeIndex])
        : handleSearch();
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <Box
      ref={wrapperRef}
      sx={{ position: "relative", maxWidth: 600, width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f1f1f1",
          borderRadius: "999px",
          px: 2,
          py: 0.5,
          width: "100%",
        }}
      >
        <InputBase
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setUserIsTyping(true);
            if (val.length < 2) {
              setSuggestions([]);
              setShowDropdown(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (userIsTyping && suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder="Search for books, authors, ISBN..."
          sx={{ flex: 1, fontSize: 14 }}
          endAdornment={
            <InputAdornment position="end">
              {loading || suggestLoading ? (
                <CircularProgress size={18} />
              ) : query ? (
                <IconButton onClick={handleClear} size="small">
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton onClick={() => handleSearch()} size="small">
                  <SearchIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          }
        />
      </Box>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1300,
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #e0e0e0",
          }}
        >
          <List disablePadding>
            {suggestions.map((item, index) => (
              <ListItem
                key={item.book_id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                sx={{
                  px: 2,
                  py: 1.2,
                  cursor: "pointer",
                  backgroundColor: activeIndex === index ? "#f0f7ff" : "white",
                  borderBottom:
                    index < suggestions.length - 1
                      ? "1px solid #f5f5f5"
                      : "none",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.2,
                }}
              >
                <Typography fontSize={14} fontWeight={500} color="text.primary">
                  <HighlightText text={item.title} query={query} />
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  <HighlightText text={item.author} query={query} />
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

function SearchBar(props: Props) {
  return (
    <React.Suspense fallback={null}>
      <SearchBarContent {...props} />
    </React.Suspense>
  );
}

export default React.memo(SearchBar);
