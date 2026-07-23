<script lang="ts">
  import { SideSheet, Form, Button, Title, Text, Banner, Radio } from '@chenzy-design/svelte';

  let visible = $state(false);

  const show = () => {
    visible = true;
  };

  const handleCancel = () => {
    visible = false;
  };
</script>

<Button onclick={show}>More Information</Button>
<SideSheet
  {visible}
  onCancel={handleCancel}
  closeIcon={null}
  headerStyle="border-bottom: 1px solid var(--cd-color-border)"
  bodyStyle="border-bottom: 1px solid var(--cd-color-border)"
>
  {#snippet titleSnippet()}
    <Title heading={4}>创建资源包</Title>
  {/snippet}

  <Form>
    <Form.DatePicker
      field="date"
      type="dateTime"
      initValue={new Date()}
      style="width: 272px"
      label={{ text: '创建时间', required: true }}
    />
    <Form.RadioGroup field="type" label="目标操作系统" direction="horizontal" initValue="all">
      <Radio value="all">全平台</Radio>
      <Radio value="ios">iOS</Radio>
      <Radio value="android">Android</Radio>
      <Radio value="web">Web</Radio>
    </Form.RadioGroup>
    <Form.RadioGroup field="origin" label="资源包来源" direction="horizontal" initValue="scm">
      <Radio value="scm">从SCM上传</Radio>
      <Radio value="manual">手动上传</Radio>
    </Form.RadioGroup>
    <Banner fullMode={false} icon={null} type="warning" bordered>
      {#snippet descriptionSnippet()}
        <Text strong>当前部署环境：线上部署</Text>
        <br />
        <Text>请选择正确的SCM构建产物，防止出现不符合预期的发布操作。</Text>
      {/snippet}
    </Banner>
    <br />
    <Form.Select
      field="users"
      label={{ text: '创建用户', required: true }}
      style="width: 560px"
      multiple
      initValue={['1', '2', '3', '4']}
      optionList={[
        { label: '曲晨一', value: '1' },
        { label: '夏可曼', value: '2' },
        { label: '曲晨三', value: '3' },
        { label: '蔡妍', value: '4' },
      ]}
    />
  </Form>

  {#snippet footer(_ctx)}
    <div style="display: flex; justify-content: flex-end">
      <Button style="margin-right: 8px">重置</Button>
      <Button theme="solid">提交</Button>
    </div>
  {/snippet}
</SideSheet>
