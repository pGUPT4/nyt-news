import { ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/forms';

interface Config {
	labelText: string;
	labelId: string;
	type: string;
	value: string;
	link?: {
		linkText: string;
		linkUrl: string;
	};
	required?: boolean;
}

interface Props {
	config: Config[];
	isLoading: boolean;
	btnText: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function Form({
	config,
	isLoading,
	btnText = 'Login',
	onChange,
	onSubmit,
}: Props) {
	return (
		<div className = 'min-h-screen flex flex-col items-center justify-center bg-black'>
			<form className='bg-gray-400 p-6 rounded-lg shadow-lg' onSubmit={onSubmit}>
				<h1 className="text-2xl font-bold mb-4">Sign Up</h1>
				{config.map(input => (
					<Input
						key={input.labelId}
						labelId={input.labelId}
						type={input.type}
						onChange={onChange}
						value={input.value}
						link={input.link}
						required={input.required}
					>
						{input.labelText}
					</Input>
				))}

				<div>
					<button
						type='submit'
						className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
					>
						{btnText}
					</button>
				</div>
			</form>
		</div>
	);
}
