import React from "react";

import AddCasesModal, { Props } from "./AddCasesModal";

const AddCasesModalContainer: React.FC<Props> = (props) => {
  return <AddCasesModal {...props} />;
};

export default AddCasesModalContainer;
