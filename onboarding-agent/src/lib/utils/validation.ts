// Shared validation helper

interface TextValidationOptions {
	fieldLabel?: string;
	minLength?: number;
	maxLength?: number;
}

export function validateText(
	value: string,
	{ fieldLabel = 'Feltet', minLength = 1, maxLength }: TextValidationOptions = {}
): string {
	const trimmed = value.trim();

	if (trimmed.length < minLength) {
		return `${fieldLabel} må være minst ${minLength} tegn.`;
	}

	if (maxLength && trimmed.length > maxLength) {
		return `${fieldLabel} kan ikke være mer enn ${maxLength} tegn.`;
	}

	return '';
}
