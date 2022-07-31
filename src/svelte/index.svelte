<script lang="ts">
  let count: number = 0;

  const increment = () => {
    count++;
  };
</script>

<h1>Hi Mom! {count}</h1>
<button on:click={increment}>increment</button>
