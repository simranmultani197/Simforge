import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="sf-label">
      <span className="sf-label__text">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
