import React, { useState } from "react";
import { Search, ExternalLink, ShieldCheck, Filter } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Chip } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

interface SourceItem {
  id: string;
  title: string;
  domain: string;
  category: "academic" | "news" | "institution";
  credibilityScore: number;
  url: string;
  snippet: string;
  publishedDate: string;
}

const MOCK_SOURCES: SourceItem[] = [
  {
    id: "src_1",
    title: "Nature International Journal of Science",
    domain: "nature.com",
    category: "academic",
    credibilityScore: 98,
    url: "https://nature.com",
    snippet: "Peer-reviewed scientific reports, experimental observations, and global datasets.",
    publishedDate: "2026-01-15"
  },
  {
    id: "src_2",
    title: "Stanford Artificial Intelligence Laboratory",
    domain: "ai.stanford.edu",
    category: "academic",
    credibilityScore: 96,
    url: "https://ai.stanford.edu",
    snippet: "Formal verification studies and LLM fact-checking methodology benchmarks.",
    publishedDate: "2025-12-20"
  },
  {
    id: "src_3",
    title: "MIT Technology Review Index",
    domain: "technologyreview.com",
    category: "news",
    credibilityScore: 92,
    url: "https://technologyreview.com",
    snippet: "Analysis of technology breakthroughs, empirical trials, and industry benchmarks.",
    publishedDate: "2026-02-01"
  },
  {
    id: "src_4",
    title: "World Health Organization Data Repository",
    domain: "who.int",
    category: "institution",
    credibilityScore: 99,
    url: "https://who.int",
    snippet: "Global public health statistics, clinical trial archives, and epidemiological metrics.",
    publishedDate: "2025-11-10"
  }
];

export const SourcesView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredSources = MOCK_SOURCES.filter((src) => {
    if (query && !src.title.toLowerCase().includes(query.toLowerCase()) && !src.domain.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== "all" && src.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Search & Filter Header */}
      <div className="space-y-3">
        <Input
          placeholder="Search trusted index domains..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Chip active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>
            All Sources
          </Chip>
          <Chip active={selectedCategory === "academic"} onClick={() => setSelectedCategory("academic")}>
            Academic
          </Chip>
          <Chip active={selectedCategory === "institution"} onClick={() => setSelectedCategory("institution")}>
            Institutions
          </Chip>
          <Chip active={selectedCategory === "news"} onClick={() => setSelectedCategory("news")}>
            News & Tech
          </Chip>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="space-y-3">
        {filteredSources.map((src) => (
          <Card key={src.id} variant="glass" className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-semibold text-primary">{src.title}</h4>
                <p className="text-[10px] font-mono text-accent mt-0.5">{src.domain}</p>
              </div>
              <Badge variant="success" size="sm">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {src.credibilityScore}% Trust
              </Badge>
            </div>

            <p className="text-xs text-primary-muted leading-relaxed line-clamp-2">
              {src.snippet}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-[10px] font-mono text-primary-muted">
                Updated {src.publishedDate}
              </span>
              <Button
                size="sm"
                variant="secondary"
                rightIcon={<ExternalLink className="w-3 h-3" />}
                onClick={() => window.open(src.url, "_blank")}
              >
                Visit Source
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
