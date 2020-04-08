import React, { useState } from "react";
import zcta from "us-zcta-counties";

import InputButton from "../../design-system/InputButton";
import InputSelect from "../../design-system/InputSelect";
import InputTextArea from "../../design-system/InputTextArea";
import InputTextOld from "../../design-system/InputTextOld";

interface FormValues {
  email?: string;
  feedback?: string;
  date?: string;
  action?: string;
  state?: string;
  county?: string;
  source?: string;
  additionalInfo?: string;
}

const states = zcta.getStates();

const Form: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    state: states[0],
  });

  function handleFormChange(field: string, value: string) {
    setFormValues({ ...formValues, [field]: value });
  }

  return (
    <div>
      <InputTextOld
        label="email"
        placeholder="Your email here..."
        onChange={(e) => handleFormChange("email", e.target.value)}
        value={formValues.email}
      />
      <InputTextOld
        label="feedback"
        placeholder="Your feedback here..."
        onChange={(e) => handleFormChange("feedback", e.target.value)}
        value={formValues.feedback}
      />
      <InputTextOld
        label="when did this occur"
        placeholder="Date..."
        onChange={(e) => handleFormChange("date", e.target.value)}
        value={formValues.date}
      />
      <InputTextOld
        label="action taken"
        placeholder="What was done?"
        onChange={(e) => handleFormChange("action", e.target.value)}
        value={formValues.action}
      />
      <div style={{ display: "flex", width: "100%" }}>
        <InputSelect
          label="state"
          value={formValues.state}
          onChange={(e) => handleFormChange("state", e.target.value)}
        >
          {states.map((state: string) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </InputSelect>
        <InputSelect
          label="county"
          value={formValues.county}
          onChange={(e) => handleFormChange("county", e.target.value)}
          disabled={!formValues.state}
        >
          {formValues.state ? (
            zcta.getCountiesByState(formValues.state).map((county: string) => (
              <option value={county} key={county}>
                {county}
              </option>
            ))
          ) : (
            <option>Please select a state first.</option>
          )}
        </InputSelect>
      </div>
      <InputTextOld
        value={formValues.source}
        label="source"
        defaultValue="https://"
        placeholder="What was done?"
        onChange={(e) => handleFormChange("source", e.target.value)}
      />
      <InputTextArea
        label="additional information"
        value={formValues.additionalInfo}
        placeholder=""
        onChange={(e) => handleFormChange("additionalInfo", e.target.value)}
      />
      <InputButton label="Send" />
    </div>
  );
};

export default Form;
