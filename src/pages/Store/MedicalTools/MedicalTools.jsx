import React from "react";
import StoreList from "../Shared/StoreList";
import MedicalToolCard from "./MedicalToolCard";

export default function MedicalTools() {
  return (
    <StoreList 
      productType="medical_tool" 
      apiPath="medical-tools" 
      title="navbar.medicalTools" 
      seoTitle="Medical Tools" 
      detailsRoute="/store/medical-tools"
      CardComponent={MedicalToolCard}
    />
  );
}
