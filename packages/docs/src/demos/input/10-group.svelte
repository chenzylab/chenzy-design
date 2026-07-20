<script lang="ts">
  import { InputGroup, Input, InputNumber, AutoComplete, DatePicker, Select } from '@chenzy-design/svelte';
</script>

<div>
  <InputGroup>
    <Input placeholder="Name" style="width: 100px;" />
    <InputNumber placeholder="Score" style="width: 140px;" />
  </InputGroup>
  <br /><br /><br />
  <InputGroup size="small">
    <Select
      style="width: 100px;"
      defaultValue="home"
      optionList={[
        { label: 'Home', value: 'home' },
        { label: 'Work', value: 'work' },
      ]}
    />
    <AutoComplete data={['Beijing Haidian']} placeholder="Address: " style="width: 180px;" />
  </InputGroup>
  <br /><br /><br />
  <InputGroup size="small">
    <Select
      style="width: 100px;"
      defaultValue="signup"
      optionList={[
        { label: 'Sign Up', value: 'signup' },
        { label: 'Sign In', value: 'signin' },
      ]}
    />
    <Input placeholder="Email" style="width: 180px;" />
  </InputGroup>
  <br /><br /><br />
  <InputGroup size="small">
    <Input placeholder="Name" style="width: 100px;" />
    <DatePicker placeholder="Birthday" />
  </InputGroup>
</div>
