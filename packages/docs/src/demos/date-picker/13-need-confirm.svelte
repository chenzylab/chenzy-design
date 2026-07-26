<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  type="dateTime"
  needConfirm={true}
  onConfirm={(value) => {
    console.log('Confirmed: ', value);
  }}
  onCancel={() => {
    console.log('Canceled');
  }}
  onChange={(...args) => {
    console.log('Changed: ', ...args);
  }}
/>
