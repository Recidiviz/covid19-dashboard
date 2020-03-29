import React from "react";
import zcta from "us-zcta-counties";

import Select from "./Select";
import TextInput from "./TextInput";

const Form: React.FC<{}> = () => {
  return (
    <div>
      <TextInput
        label="email"
        placeholder="Your email here..."
        onChange={(e) => console.log(e.target.value)}
      />
      <TextInput
        label="feedback"
        placeholder="Your feedback here..."
        onChange={(e) => console.log(e.target.value)}
      />
      <TextInput
        label="when did this occur"
        placeholder="Date..."
        onChange={(e) => console.log(e.target.value)}
      />
      <TextInput
        label="action taken"
        placeholder="What was done?"
        onChange={(e) => console.log(e.target.value)}
      />
      <div style={{ display: "flex", width: "100%" }}>
        <Select label="state">
          {zcta.getStates().map((state: string) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
        <Select label="county">
          {zcta.getStates().map((state: string) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
      </div>
      <TextInput
        label="source"
        defaultValue="https://"
        placeholder="What was done?"
        onChange={(e) => console.log(e.target.value)}
      />
    </div>
  );
};

export default Form;
