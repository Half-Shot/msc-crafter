import type { JSX } from "preact/jsx-runtime";
import styled from "styled-components";

const Button = styled.button`
  font-size: 1.15em;
  border-radius: 0;
  border: 1px solid black;
  height: 100%;
  padding: 0.5em 0.75em;

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
        <Button
          key={value}
          onClick={() => onChange(value)}
          disabled={currentValue === value}
        >
          {labels[value] ?? value}
        </Button>
      ))}
    </Fieldset>
  );
}
