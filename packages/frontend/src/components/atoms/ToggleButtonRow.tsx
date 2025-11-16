import type { JSX } from "preact/jsx-runtime";
import styled from "styled-components";
import { Button } from "./Button";

const ToggleButton = styled(Button)`
  border-radius: 0;
  &:nth-child(1) {
    border-radius: var(--mc-border-radius) 0em 0em var(--mc-border-radius);
    border-right: 0;
  }
  &:last-child {
    border-radius: 0 var(--mc-border-radius) var(--mc-border-radius) 0;
    border-left: 0;
  }
`;

const Fieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  font-size: 0.8em;
`;

export function ToggleButtonRow<T extends string>({
  values,
  labels = {},
  value: currentValue,
  onChange,
}: {
  values: T[];
  value: T;
  labels?: Partial<Record<T, JSX.Element>>;
  onChange: (value: T) => void;
}) {
  return (
    <Fieldset>
      {values.map((value) => (
        <ToggleButton
          key={value}
          onClick={() => onChange(value)}
          disabled={currentValue === value}
        >
          {labels[value] ?? value}
        </ToggleButton>
      ))}
    </Fieldset>
  );
}
