import { BookCard } from "../BookCard";

export default function BookCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <BookCard
        id="1"
        isbn="9780545010221"
        title="Harry Potter and the Deathly Hallows"
        author="J.K. Rowling"
        amazonPrice={24.99}
        ebayPrice={22.50}
        yourCost={8.00}
        profit={14.50}
        status="profitable"
        onViewDetails={() => console.log("View details")}
        onQuickList={() => console.log("Quick list")}
      />
      
      <BookCard
        id="2"
        isbn="9780316769488"
        title="The Catcher in the Rye"
        author="J.D. Salinger"
        amazonPrice={12.00}
        ebayPrice={11.50}
        yourCost={11.00}
        profit={0.50}
        status="break-even"
        onViewDetails={() => console.log("View details")}
        onQuickList={() => console.log("Quick list")}
      />

      <BookCard
        id="3"
        isbn="9780060935467"
        title="To Kill a Mockingbird"
        author="Harper Lee"
        status="pending"
        isPending={true}
        onViewDetails={() => console.log("View details")}
        onQuickList={() => console.log("Quick list")}
      />
    </div>
  );
}
