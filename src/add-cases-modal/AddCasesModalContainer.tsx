import React from "react";

// import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
// import { useLocaleDataState } from "../locale-data-context";
import AddCasesModal, { Props } from "./AddCasesModal";

const AddCasesModalContainer: React.FC<Props> = (props) => {
  // const { data: localeDataSource } = useLocaleDataState();
  return (
    // <EpidemicModelProvider
    //   localeDataSource={localeDataSource}
    //   facilityModel={props.facility.modelInputs}
    // >
    <AddCasesModal {...props} />
    // </EpidemicModelProvider>
  );
};

export default AddCasesModalContainer;
