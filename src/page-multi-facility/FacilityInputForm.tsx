import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import InputButton from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputNameWithIcon from "../design-system/InputNameWithIcon";
import ChartArea from "../impact-dashboard/ChartArea";
import { PlannedRelease } from "../impact-dashboard/EpidemicModelContext";
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
  const [facilityName, setFacilityName] = useState(facility?.name || undefined);
  const [description, setDescription] = useState(
    facility?.description || undefined,
  );
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    // When saving an object to Firestore, Firestore will reject it if it is not
    // serializable. This type enforces that what we are saving is serializable.
    // In the future, we add new properties to the model that are not
    // serializable, we will get a TS error below.
    //
    // Definition inspired by the one posted here:
    // https://github.com/microsoft/TypeScript/issues/1897#issuecomment-338650717
    type JsonSerializable =
      | boolean
      | number
      | Date
      | string
      | undefined
      | JsonSerializable[]
      | { [key: string]: JsonSerializable };

    let modelInputs: JsonSerializable = {
      ...model[0],

      // We don't need to save localeDataSource.
      localeDataSource: undefined,
    };

    saveFacility({
      id: facility?.id,
      name: facilityName || null,
      description: description || null,
      systemType: systemType || null,
      modelInputs,
    }).then((_) => {
      navigate("/");
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
