<script lang="ts">
  import { Slider, Button } from '@chenzy-design/svelte';

  let value = $state<number>(10);

  const changeValue = () => {
    value = value + 10;
  };
</script>

<div>
  <Button onclick={changeValue} style="margin-right: 20px">点击改变value值</Button>
  <br />
  <br />
  <Slider {value} />
</div>
