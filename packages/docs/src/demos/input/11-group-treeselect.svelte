<script lang="ts">
  import { InputGroup, Select, Cascader, TreeSelect } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: 'Asia',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: 'China',
          value: 'China',
          key: '0-0',
          children: [
            { label: 'Beijing', value: 'Beijing', key: '0-0-0' },
            { label: 'Shanghai', value: 'Shanghai', key: '0-0-1' },
          ],
        },
      ],
    },
    { label: 'North America', value: 'North America', key: '1' },
  ];
</script>

<InputGroup>
  <Select
    style="width: 100px;"
    defaultValue="from"
    optionList={[
      { label: 'From: ', value: 'from' },
      { label: 'To: ', value: 'to' },
    ]}
  />
  <TreeSelect style="width: 220px;" {treeData} placeholder="Please select" />
</InputGroup>
<br /><br />
<InputGroup>
  <Select
    style="width: 100px;"
    defaultValue="from"
    optionList={[
      { label: 'From: ', value: 'from' },
      { label: 'To: ', value: 'to' },
    ]}
  />
  <Cascader style="width: 220px;" {treeData} placeholder="Please select" />
</InputGroup>
