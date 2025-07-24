import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, DollarSign, Search, Filter, Star, Eye, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface MarketplaceListing {
  id: number;
  sellerId: number;
  workId: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  licenseType: string;
  tags: string[];
  status: string;
  createdAt: string;
  sellerName: string;
  workImageUrl?: string;
}

export default function MarketplaceSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("recent");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["/api/marketplace/listings", {
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      priceMin: priceRange.min ? Number(priceRange.min) : undefined,
      priceMax: priceRange.max ? Number(priceRange.max) : undefined,
      limit: 12,
      offset: 0,
    }],
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "digital_art", label: "Digital Art" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "video", label: "Video" },
    { value: "3d_models", label: "3D Models" },
    { value: "templates", label: "Templates" },
    { value: "fonts", label: "Fonts" },
    { value: "other", label: "Other" },
  ];

  const licenseTypes = {
    "personal": "Personal Use",
    "commercial": "Commercial Use",
    "extended": "Extended License",
    "exclusive": "Exclusive Rights",
  };

  const formatPrice = (price: number, currency: string) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      ETH: "Ξ",
      BTC: "₿",
    };
    return `${symbols[currency] || currency} ${price.toFixed(2)}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger search with current query
    // This would typically update the query key to refetch with search parameters
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="backdrop-blur-xl bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-400" />
              Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="backdrop-blur-xl bg-white/5 border-white/10">
                  <div className="aspect-video bg-white/10 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse" />
                      <div className="w-1/2 h-3 bg-white/10 rounded animate-pulse" />
                      <div className="w-1/4 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-xl bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-400" />
            Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for artwork, templates, music..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
              <Button type="submit" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Input
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Min price"
                  type="number"
                  className="w-24 bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                <Input
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Max price"
                  type="number"
                  className="w-24 bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Listings Grid */}
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: MarketplaceListing) => (
                <Card key={listing.id} className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="relative">
                    {listing.workImageUrl ? (
                      <img 
                        src={listing.workImageUrl} 
                        alt={listing.title}
                        className="w-full aspect-video object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center rounded-t-lg">
                        <Eye className="h-8 w-8 text-white/50" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500/90 text-white">
                        {formatPrice(listing.price, listing.currency)}
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                        {licenseTypes[listing.licenseType] || listing.licenseType}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">4.8</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {listing.sellerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-300">{listing.sellerName}</span>
                    </div>
                    
                    {listing.tags && listing.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {listing.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                        {listing.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            +{listing.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>247</span>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        onClick={() => {
                          // Handle purchase/view details
                        }}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                No marketplace listings match your current filters. Try adjusting your search criteria or browse all categories.
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-white/10 text-white hover:bg-white/5"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setPriceRange({ min: "", max: "" });
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}