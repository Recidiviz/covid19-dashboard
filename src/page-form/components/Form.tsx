import React, { useState } from "react";
import { toast } from "react-toastify";
import zcta from "us-zcta-counties";

import Button from "./Button";
import DatePicker from "./DatePicker";
import Select from "./Select";
import TextArea from "./TextArea";
import TextInput from "./TextInput";

interface FormValues {
  email?: string;
  feedback?: string;
  date?: Date;
  action?: string;
  state?: string;
  county?: string;
  source?: string;
  additionalInfo?: string;
}

const states = zcta.getStates();

const Form: React.FC<{}> = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    state: states[0],
    date: new Date(),
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  function handleFormChange(field: string, value: string | Date) {
    setFormValues({ ...formValues, [field]: value });
  }

  async function submitForm() {
    setIsSubmitting(true);
    console.log("sending form values ", formValues);
    try {
      await fetch(`${window.location.origin}/api/submit-form`, {
        method: "POST",
        body: JSON.stringify(formValues),
      });
      toast.success("Form submitted! Thank you for your contribution!", {
        className: "toast-success",
      });
    } catch (e) {
      toast.warn(
        "There was a problem submitting this form. Please try again.",
        { className: "toast-warn" },
      );
    }
    setIsSubmitting(false);
    setHasSubmitted(true);
  }

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
      <DatePicker
        date={formValues.date}
        setDate={(date: Date) => handleFormChange("date", date)}
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
          {states.map((state: string) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
        <Select
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
        </Select>
      </div>
      <TextInput
        value={formValues.source}
        label="source"
        defaultValue="https://"
        placeholder="What was done?"
        onChange={(e) => handleFormChange("source", e.target.value)}
      />
      <TextArea
        label="additional information"
        value={formValues.additionalInfo}
        onChange={(e) => handleFormChange("additionalInfo", e.target.value)}
      />
      <Button
        loading={isSubmitting}
        label={hasSubmitted ? "Sent!" : "Send"}
        onClick={submitForm}
      />
    </div>
  );
};

export default Form;
