import React, { useState } from "react";
import zcta from "us-zcta-counties";

import Select from "./Select";
import TextInput from "./TextInput";

interface FormValues {
  email?: string;
  feedback?: string;
  date?: string;
  action?: string;
  state?: string;
  county?: string;
  source?: string;
}

const Form: React.FC<{}> = () => {
  const [formValues, setFormValues] = useState<FormValues>({});

  function handleFormChange(field: string, value: string) {
    setFormValues({ ...formValues, [field]: value });
  }

  console.log(formValues);
  return (
    <div>
      <TextInput
        label="email"
        placeholder="Your email here..."
        onChange={(e) => handleFormChange("email", e.target.value)}
        value={formValues.email}
      />
      <TextInput
        label="feedback"
        placeholder="Your feedback here..."
        onChange={(e) => handleFormChange("feedback", e.target.value)}
        value={formValues.feedback}
      />
      <TextInput
        label="when did this occur"
        placeholder="Date..."
        onChange={(e) => handleFormChange("date", e.target.value)}
        value={formValues.date}
      />
      <TextInput
        label="action taken"
        placeholder="What was done?"
        onChange={(e) => handleFormChange("action", e.target.value)}
        value={formValues.action}
      />
      <div style={{ display: "flex", width: "100%" }}>
        <Select
          label="state"
          value={formValues.state}
          onChange={(e) => handleFormChange("state", e.target.value)}
        >
          {zcta.getStates().map((state: string) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
        <Select
          label="county"
          value={formValues.county}
          onChange={(e) => handleFormChange("county", e.target.value)}
        >
          {zcta.getStates().map((state: string) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
      </div>
      <TextInput
        value={formValues.source}
        label="source"
        defaultValue="https://"
        placeholder="What was done?"
        onChange={(e) => handleFormChange("source", e.target.value)}
      />
    </div>
  );
};

export default Form;
