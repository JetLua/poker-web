<script lang="ts">
  import Chart from './Chart.svelte'
  const st = $state({
    data: {age: 1}
  })
</script>

<div class="flex flex-col items-center justify-center">
  <Chart data={st.data}/>
  <button onclick={() => {
    st.data.age++
  }}>ok</button>
</div>
