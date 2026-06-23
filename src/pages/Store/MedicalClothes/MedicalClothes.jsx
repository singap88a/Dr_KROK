import React from "react";
import StoreList from "../Shared/StoreList";
import MedicalToolCard from "../MedicalTools/MedicalToolCard";

export default function MedicalClothes() {
  return (
    <StoreList 
      productType="medical_clothes" 
      apiPath="apparels" 
      title="navbar.medicalClothes" 
      seoTitle="Medical Clothes" 
      detailsRoute="/store/medical-clothes"
      CardComponent={MedicalToolCard}
    />
  );
}
