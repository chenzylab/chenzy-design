<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  type="dateTime"
  needConfirm={true}
  onConfirm={(e) => {
    console.log('Confirmed: ', e.value);
  }}
  onCancel={() => {
    console.log('Canceled');
  }}
  onChange={(...args) => {
    console.log('Changed: ', ...args);
  }}
/>
