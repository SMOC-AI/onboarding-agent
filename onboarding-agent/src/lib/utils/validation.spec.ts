import { describe, expect, it } from 'vitest';
import { validateText } from './validation';

describe('validateText', () => {
	it('returnerer tom string for gyldig input', () => {
		const result = validateText('  Gyldig svar  ', {
			fieldLabel: 'Svar',
			minLength: 2,
			maxLength: 20
		});

		expect(result).toBe('');
	});

	it('returnerer minLength feil for for kort input', () => {
		const result = validateText('a', {
			fieldLabel: 'Selskapsnavn',
			minLength: 2
		});

		expect(result).toBe('Selskapsnavn må være minst 2 tegn.');
	});

	it('returnerer maxLength feil for for lang tekst', () => {
		const result = validateText('x'.repeat(81), {
			fieldLabel: 'Selskapsnavn',
			minLength: 2,
			maxLength: 80
		});

		expect(result).toBe('Selskapsnavn kan ikke være mer enn 80 tegn.');
	});

	it('returnerer maxLength feil for for lang tekst', () => {
		const result = validateText('x'.repeat(281), {
			fieldLabel: 'Svar',
			minLength: 2,
			maxLength: 280
		});

		expect(result).toBe('Svar kan ikke være mer enn 280 tegn.');
	});
});
