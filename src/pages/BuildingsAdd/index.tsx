import React from "react";
import { BuildingAddForm } from "./components";

const BuildingsAdd: React.FC = () => {

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6">
      <BuildingAddForm  />
    </div>
  );
};

export default BuildingsAdd;
