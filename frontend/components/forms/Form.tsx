import { ChangeEvent, FormEvent, ReactNode } from 'react';
import Input from './Input';

interface Config {
  labelText: string;
  labelId: string;
  type: string;
  value: string;
  required?: boolean;
}

interface Props {
  config: Config[];
  formHeader: string;
  btnText: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children?: ReactNode; // Add children prop to accept <p> tag
}

export default function Form({
  config,
  formHeader,
  btnText,
  onChange,
  onSubmit,
  children, // Destructure children
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-flex flex-col items-center justify-center">
        <form className="bg-slate-800 p-6 rounded-lg shadow-lg w-xl" onSubmit={onSubmit}>
          <h1 className="text-2xl font-bold mb-4">{formHeader}</h1>
          {config.map(input => (
            <Input
              key={input.labelId}
              labelId={input.labelId}
              type={input.type}
              onChange={onChange}
              value={input.value}
              required={input.required}
            >
              {input.labelText}
            </Input>
          ))}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {btnText}
            </button>
          </div>
        </form>
        {children}
      </div>
    </div>
  );
}