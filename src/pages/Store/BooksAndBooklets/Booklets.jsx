import React from "react";
import StoreList from "../Shared/StoreList";
import BookCard from "../Shared/BookCard";

export default function Booklets() {
  return (
    <StoreList 
      productType="booklet" 
      apiPath="books" 
      title="navbar.booklets" 
      seoTitle="Medical Booklets" 
      detailsRoute="/store/booklets"
      CardComponent={BookCard}
    />
  );
}
