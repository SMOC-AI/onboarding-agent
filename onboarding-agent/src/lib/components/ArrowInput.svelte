<script lang="ts">
	let {
		value = $bindable(''),
		name = '',
		placeholder = '',
		minLength,
		disabled = false,
	} = $props<{
		value?: string;
		name?: string;
		placeholder?: string;
		minLength?: number;
		disabled?: boolean;
	}>();
</script>

<div class="input-row">
	<input bind:value {name} {placeholder} required minlength={minLength}/>
	<button class="submit-circle" type="submit" {disabled}>
		<img class="submit-image" src="/icons/whiteArrow.png" alt="pil"/>
	</button>
</div>
