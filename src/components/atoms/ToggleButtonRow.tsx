import styled from "styled-components";

const Button = styled.button`
  font-size: 1.15em;
  border-radius: 0;
  border: 1px solid black;

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
  margin-top: 1em;
  padding: 0;
`;

export function ToggleButtonRow<T extends string>({
  values,
  value: currentValue,
  onChange,
}: {
  values: T[];
  value: T;
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
          {value}
        </Button>
      ))}
    </Fieldset>
  );
}
