import React from "react";
import StoreList from "../Shared/StoreList";
import BookCard from "../Shared/BookCard";

export default function Books() {
  return (
    <StoreList 
      productType="book" 
      apiPath="books" 
      title="books.medical_books_store" 
      seoTitle="Medical Books Store" 
      detailsRoute="/store/books"
      CardComponent={BookCard}
    />
  );
}
