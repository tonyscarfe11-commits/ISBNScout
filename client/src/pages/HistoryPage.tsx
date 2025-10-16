import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // todo: remove mock functionality
  const mockBooks: BookDetails[] = [
    {
      id: "1",
      isbn: "9780545010221",
      title: "Harry Potter and the Deathly Hallows",
      author: "J.K. Rowling",
      amazonPrice: 24.99,
      ebayPrice: 22.50,
      yourCost: 8.00,
      profit: 16.99,
      status: "profitable",
    },
    {
      id: "2",
      isbn: "9780316769488",
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      amazonPrice: 12.00,
      ebayPrice: 11.50,
      yourCost: 11.00,
      profit: 1.00,
      status: "break-even",
    },
    {
      id: "3",
      isbn: "9780060935467",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      amazonPrice: 8.00,
      ebayPrice: 7.50,
      yourCost: 12.00,
      profit: -4.00,
      status: "loss",
    },
    {
      id: "4",
      isbn: "9780061120084",
      title: "1984",
      author: "George Orwell",
      status: "pending",
      isPending: true,
    },
  ];

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);

    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (book: BookDetails) => {
    setSelectedBook(book);
    setDetailsOpen(true);
  };

  const handleQuickList = (book: BookDetails) => {
    toast({
      title: "Quick List",
      description: `Opening listing form for ${book.title}`,
    });
  };

  const handleListFromModal = (platform: "amazon" | "ebay") => {
    toast({
      title: `Listing to ${platform}`,
      description: "Feature coming soon!",
    });
    setDetailsOpen(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Scan History</h1>
          <p className="text-sm text-muted-foreground">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} scanned
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-history"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="profitable">Profitable</SelectItem>
              <SelectItem value="break-even">Break Even</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No books found</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onViewDetails={() => handleViewDetails(book)}
                onQuickList={() => handleQuickList(book)}
              />
            ))}
          </div>
        )}
      </div>

      <BookDetailsModal
        book={selectedBook}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onList={handleListFromModal}
      />
    </div>
  );
}
