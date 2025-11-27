<script lang="ts">
	import { goto } from "$app/navigation";

    const signIn = async () => {
        goto("/login");
    };

    const signOut = async () => {
        goto("/logout");
    };

    const { user } = $props();
</script>

<h1>Welcome to the client</h1>

<button onclick={signIn}>Login</button>


<style>
    button {
        padding: 10px 20px;
        background-color: #ff8800;
        color: #ffffff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #ff6600;
    }

    button:active {
        background-color: #ff4400;
    }
</style>