<script lang="ts">
  // 表单布局 - 更复杂的布局：结合 Row、Col 对表单进行排列。
  // 对齐 Semi「表单布局」第④个 demo（Row/Col 复杂布局）。
  import { Form, Row, Col } from '@chenzy-design/svelte';
</script>

<Form labelPosition="top" style="padding: 10px">
  <Row>
    <Col span={8}>
      <Form.Input
        field="nickName1"
        label="用户名"
        style="width: 250px"
        trigger="blur"
        rules={[
          { required: true, message: 'required error' },
          { validator: (v) => (v === 'semi' ? undefined : 'should be semi') },
        ]}
      />
    </Col>
    <Col span={8}>
      <Form.DatePicker field="date1" label="有效日期" style="width: 250px" />
    </Col>
    <Col span={8}>
      <Form.Select label="业务线" field="business1" style="width: 250px"
        optionList={[
          { label: 'Semi', value: 'abc' },
          { label: '轻颜相机', value: 'ulikeCam' },
          { label: '今日头条', value: 'toutiao' },
        ]} />
    </Col>
  </Row>
  <Row>
    <Col span={6}>
      <Form.Input
        field="nickName2"
        label="用户名"
        style="width: 200px"
        trigger="blur"
        rules={[
          { required: true, message: 'required error' },
          { validator: (v) => (v === 'semi' ? undefined : 'should be semi') },
        ]}
      />
    </Col>
    <Col span={6}>
      <Form.DatePicker field="date2" label="有效日期" style="width: 200px" />
    </Col>
    <Col span={6}>
      <Form.Select label="业务线" field="business2" style="width: 200px"
        optionList={[
          { label: 'Semi', value: 'abc' },
          { label: '轻颜相机', value: 'ulikeCam' },
          { label: '今日头条', value: 'toutiao' },
        ]} />
    </Col>
    <Col span={6}>
      <Form.Select field="role" label="角色" style="width: 200px"
        optionList={[
          { label: '运营', value: 'operate' },
          { label: '开发', value: 'rd' },
          { label: '产品', value: 'pm' },
          { label: '设计', value: 'ued' },
        ]} />
    </Col>
  </Row>
</Form>
