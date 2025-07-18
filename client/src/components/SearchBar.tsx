import { useState } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  onTrendingClick: () => void;
  placeholder?: string;
  currentQuery?: string;
}

const trendingSearches = [
  "digital art",
  "NFT creation",
  "blockchain",
  "copyright protection",
  "photography",
  "music",
  "collaboration",
  "trending creators"
];

export default function SearchBar({ 
  onSearch, 
  onClear, 
  onTrendingClick, 
  placeholder = "Search posts, users, and content...",
  currentQuery = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(currentQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    setShowSuggestions(false);
  };

  const handleTrendingSearch = (term: string) => {
    setQuery(term);
    onSearch(term);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-12 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onTrendingClick}
              className="h-8 px-3 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-black/80 border-white/10 z-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="h-4 w-4" />
                <span>Trending searches</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="cursor-pointer hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                    onClick={() => handleTrendingSearch(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
              
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  Press Enter to search, or click trending topics above
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}