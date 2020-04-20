import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import InputButton from "../design-system/InputButton";
import InputText from "../design-system/InputText";
import ChartArea from "../impact-dashboard/ChartArea";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import useModel from "../impact-dashboard/useModel";
import { FacilityContext } from "./FacilityContext";
import FacilityInformationSection from "./FacilityInformationSection";
import LocaleInformationSection from "./LocaleInformationSection";

const FacilityInputFormDiv = styled.div`
  display: flex;
  flex-direction: row;
`;
const LeftColumn = styled.div`
  margin: 20px;
  width: 45%;
`;
const RightColumn = styled.div`
  margin: 20px;
  width: 55%;
`;

const ButtonSection = styled.div`
  margin-top: 30px;
`;

// TODO add section header tooltips
// TODO add summary at bottom of Locale Information
const FacilityInputForm: React.FC = () => {
  const { facility } = useContext(FacilityContext);
  const history = useHistory();
  const [facilityName, setFacilityName] = useState(facility?.name);
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    saveFacility({
      id: facility?.id,
      name: facilityName || "Unnamed Facility",
      systemType: systemType || null,
      modelInputs: JSON.parse(JSON.stringify(model))[0],
    });
    history.push("/");
  };

  return (
    <FacilityInputFormDiv>
      <LeftColumn>
        <InputText
          type="text"
          valueEntered={facilityName}
          valuePlaceholder="Unnamed Facility"
          onValueChange={(value) => setFacilityName(value)}
        />
        <div className="mt-5 mb-5 border-b border-gray-300" />
        <LocaleInformationSection
          systemType={systemType}
          setSystemType={setSystemType}
        />
        <FacilityInformationSection />
        <MitigationInformation />
        <ButtonSection>
          <InputButton label="Save" onClick={save} />
        </ButtonSection>
        <div className="mt-8" />
      </LeftColumn>
      <RightColumn>
        <ChartArea />
        <ImpactProjectionTable />
      </RightColumn>
    </FacilityInputFormDiv>
  );
};

export default FacilityInputForm;
