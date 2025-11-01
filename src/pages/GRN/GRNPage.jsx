"use client";

import { useState } from "react";
import GRN from "./GRN";
import GRNList from "./GRNList/GRNList";

const GRNPage = () => {
  const [editingGRN, setEditingGRN] = useState(null);
  const [showList, setShowList] = useState(true);

  const handleEditGRN = (grn) => {
    setEditingGRN(grn);
    setShowList(false);
  };

  const handleCreateNew = () => {
    setEditingGRN(null);
    setShowList(false);
  };

  const handleBackToList = () => {
    setEditingGRN(null);
    setShowList(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      {showList ? (
        <GRNList onEditGRN={handleEditGRN} onCreateNew={handleCreateNew} />
      ) : (
        <GRN editingGRN={editingGRN} onBackToList={handleBackToList} />
      )}
    </div>
  );
};

export default GRNPage;
