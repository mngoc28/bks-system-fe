import React from "react";
import { PropertyAddForm } from "./components";

/**
 * Add Property Page
 * A simple container for the property creation form.
 */
const PropertiesAdd: React.FC = () => {

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6">
      <PropertyAddForm  />
    </div>
  );
};

export default PropertiesAdd;

