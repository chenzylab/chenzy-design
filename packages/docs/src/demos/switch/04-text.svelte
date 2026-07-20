<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';
</script>

<div>
  <Switch checkedText="开" uncheckedText="关" />
  <Switch checkedText="｜" uncheckedText="〇" style="margin-left: 5px;" />
  <br />
  <br />
  <Switch defaultChecked checkedText="开" uncheckedText="关" />
  <Switch defaultChecked checkedText="｜" uncheckedText="〇" style="margin-left: 5px;" />
  <br />
  <br />
  <Switch checkedText="开" uncheckedText="关" size="large" />
  <Switch checkedText="｜" uncheckedText="〇" size="large" style="margin-left: 5px;" />
  <br />
  <br />
  <Switch defaultChecked checkedText="开" uncheckedText="关" size="large" />
  <Switch defaultChecked checkedText="｜" uncheckedText="〇" size="large" style="margin-left: 5px;" />
</div>
