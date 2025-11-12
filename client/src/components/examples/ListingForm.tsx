import { ListingForm } from "../ListingForm";

export default function ListingFormExample() {
  return (
    <div className="p-4 max-w-2xl">
      <ListingForm
        bookId="example-book-id"
        bookTitle="Harry Potter and the Deathly Hallows"
        author="J.K. Rowling"
        isbn="9780545010221"
        suggestedPrice={24.99}
        onSubmit={(data) => console.log("Listing submitted:", data)}
      />
    </div>
  );
}
