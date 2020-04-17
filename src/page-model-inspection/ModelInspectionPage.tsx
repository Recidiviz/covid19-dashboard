import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputTextNumeric from "../design-system/InputTextNumeric";
import Description from "../impact-dashboard/Description";
import {
  useEpidemicModelDispatch,
  useEpidemicModelState,
} from "../impact-dashboard/EpidemicModelContext";
import FacilityInformation from "../impact-dashboard/FacilityInformation";
import {
  FormGrid,
  FormGridCell,
  FormGridRow,
} from "../impact-dashboard/FormGrid";
import LocaleInformation from "../impact-dashboard/LocaleInformation";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import ModelInspectionTable from "./ModelInspectionTableContainer";
import ModelOutputChartArea from "./ModelOutputChartArea";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const SectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 16px;
  margin-bottom: 16px;
`;

const SubsectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  margin-bottom: 12px;
`;

/* Charts */

const ChartsContainer = styled.div`
  flex: 2 0 auto;
  width: 350px;
  margin: 0 15px;
`;

const ErrorMessage = styled.div`
  margin: 10px;
`;

const ImpactDashboardVDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 30px;
`;

const FormColumn = styled.div`
  box-sizing: border-box;
  flex: 1 0 auto;
  width: 350px;
  border-right: ${borderStyle};
  padding-bottom: 30px;
  padding-right: 25px;
`;

const HorizontalDivider = styled.hr`
  border-top: ${borderStyle};
  margin: 40px 0;
`;

const ModelInspectionPage: React.FC = () => {
  const {
    countyLevelDataFailed,
    overrideR0Cells,
    overrideR0Dorms,
  } = useEpidemicModelState();
  const dispatch = useEpidemicModelDispatch();
  return (
    <div>
      {countyLevelDataFailed ? (
        <ErrorMessage>Error: unable to load data!</ErrorMessage>
      ) : (
        <>
          <SectionHeader>Locale Information</SectionHeader>
          <LocaleInformation />
          <SectionHeader>Facility Customization</SectionHeader>
          <ImpactDashboardVDiv>
            <FormColumn>
              <SubsectionHeader>Facility Population</SubsectionHeader>
              <FacilityInformation />
              <HorizontalDivider />
              <SubsectionHeader>COVID-19 Mitigation Efforts</SubsectionHeader>
              <MitigationInformation />
              <SubsectionHeader>Override R0</SubsectionHeader>
              <Description>
                Override the model's computed/derived R0 value, for testing
                purposes.
              </Description>
              <FormGrid>
                <FormGridRow>
                  <FormGridCell>
                    <InputTextNumeric
                      labelAbove="Override for cells"
                      type="number"
                      onValueChange={(v) =>
                        dispatch({
                          type: "update",
                          payload: { overrideR0Cells: v },
                        })
                      }
                      valueEntered={overrideR0Cells}
                    />
                  </FormGridCell>
                  <FormGridCell>
                    <InputTextNumeric
                      labelAbove="Override for dorms"
                      type="number"
                      onValueChange={(v) =>
                        dispatch({
                          type: "update",
                          payload: { overrideR0Dorms: v },
                        })
                      }
                      valueEntered={overrideR0Dorms}
                    />
                  </FormGridCell>
                </FormGridRow>
              </FormGrid>
            </FormColumn>
            <ChartsContainer>
              <ModelOutputChartArea />
            </ChartsContainer>
          </ImpactDashboardVDiv>
          <ModelInspectionTable />
        </>
      )}
    </div>
  );
};

export default ModelInspectionPage;
