<script lang="ts">
	let {
		value = $bindable(''),
		name = '',
		placeholder = '',
		minLength,
		error = '',
		inputId = '',
	} = $props<{
		value?: string;
		name?: string;
		placeholder?: string;
		minLength?: number;
		error?: string;
		inputId?: string;
	}>();
</script>

<div>
	<div class="input-row">
		<input id={inputId || name || 'field'} bind:value {name} {placeholder} required minlength={minLength} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${(inputId || name || 'field')}-error` : undefined}/>
		<button class="submit-circle" type="submit">
			<img class="submit-image" src="/icons/whiteArrow.png" alt="pil"/>
		</button>
	</div>
	{#if error}
		<p class="field-error" id={`${(inputId || name || 'field')}-error`}>{error}</p>
	{/if}
</div>
