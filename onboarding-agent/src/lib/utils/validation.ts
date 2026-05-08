// Dette er en shared validation helper for (per nå) enkle minimum character checks,
// som kan potensielt  utvides med strengere validation for backend senere.

export function isFilled(value: string, minLength = 1): boolean {
	return value.trim().length >= minLength;
}
