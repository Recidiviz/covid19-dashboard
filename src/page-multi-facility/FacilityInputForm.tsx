import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import InputButton from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputNameWithIcon from "../design-system/InputNameWithIcon";
import InputText from "../design-system/InputText";
import PopUpMenu from "../design-system/PopUpMenu";
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

// mockup divs and menu items
const TestDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TestTitle = styled.div`
  margin: auto 0;
`;
const popupItems = [
  {
    name: "Something",
    onClick: () => console.log("click something "),
  },
  { name: "Delete", onClick: () => console.log("click delete") },
];

interface Props {
  scenarioId: string;
}

const FacilityInputForm: React.FC<Props> = ({ scenarioId }) => {
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
    saveFacility(scenarioId, {
      id: facility?.id,
      name: facilityName || null,
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
          placeholderValue="Unnamed Facility"
        />
        <InputDescription
          description={description}
          setDescription={setDescription}
          placeholderValue="Enter a description (optional)"
        />
        <div className="mt-5 mb-5 border-b border-gray-300" />

        <TestDiv>
          <TestTitle>SOMETHIGN HERE</TestTitle>
          <PopUpMenu items={popupItems} />
        </TestDiv>

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
