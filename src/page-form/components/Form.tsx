import React from "react";

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
