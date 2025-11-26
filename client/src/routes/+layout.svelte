<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Client</title>
</svelte:head>

{@render children()}

<style>
	:global(body) {
		background-color: #000000;
		color: #ffffff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	:global(a) {
		color: #ff8800;
		text-decoration: none;
	}
</style>