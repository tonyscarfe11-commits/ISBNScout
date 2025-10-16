import { useState } from "react";
import { BookDetailsModal } from "../BookDetailsModal";
import { Button } from "@/components/ui/button";

export default function BookDetailsModalExample() {
  const [open, setOpen] = useState(false);

  const mockBook = {
    id: "1",
    isbn: "9780545010221",
    title: "Harry Potter and the Deathly Hallows",
    author: "J.K. Rowling",
    amazonPrice: 24.99,
    ebayPrice: 22.50,
    yourCost: 8.00,
    profit: 14.50,
    status: "profitable" as const,
    description: "The seventh and final adventure in the Harry Potter series.",
  };

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Book Details</Button>
      <BookDetailsModal
        book={mockBook}
        open={open}
        onOpenChange={setOpen}
        onList={(platform) => {
          console.log("List to", platform);
          setOpen(false);
        }}
      />
    </div>
  );
}
