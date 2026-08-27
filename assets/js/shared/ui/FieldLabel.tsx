export type FieldLabelProps = {
  text: string;
  required?: boolean;
  htmlFor?: string;
  id?: string;
};

export function FieldLabel({ text, required, htmlFor, id }: FieldLabelProps) {
  return (
    <label id={id} htmlFor={htmlFor} className="text-main block text-base font-semibold">
      {text}
      {required === true && <span className="text-error"> *</span>}
    </label>
  );
}
