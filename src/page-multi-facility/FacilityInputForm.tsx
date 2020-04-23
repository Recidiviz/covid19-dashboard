import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import InputButton from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputNameWithIcon from "../design-system/InputNameWithIcon";
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

const FacilityInputForm: React.FC = () => {
  const { facility } = useContext(FacilityContext);
  const history = useHistory();
  const [facilityName, setFacilityName] = useState(facility?.name || undefined);
  const [description, setDescription] = useState(
    facility?.description || undefined,
  );
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    saveFacility({
      id: facility?.id,
      name: facilityName || "Unnamed Facility",
      description: description || null,
      systemType: systemType || null,
      modelInputs: JSON.parse(JSON.stringify(model))[0],
    }).then((_) => {
      history.push("/");
    });
  };

  return (
    <FacilityInputFormDiv>
      <LeftColumn>
        <InputNameWithIcon
          name={facilityName}
          setName={setFacilityName}
          placeholder={"Unnamed Facility"}
        />
        <InputDescription
          description={description}
          setDescription={setDescription}
        />
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
