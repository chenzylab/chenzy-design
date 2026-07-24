<script lang="ts">
  import { PinCode, Text } from '@chenzy-design/svelte';

  // 使用 format 控制可输入的字符范围：
  //  'number' 只允许数字；'mixed' 允许数字和字母；正则只允许通过判定的字符；
  //  函数则逐字符校验，返回 true 时允许输入。
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div>
    <Text>纯数字</Text>
    <PinCode format="number" onComplete={(v) => console.log('pincode: ', v)} />
  </div>
  <div>
    <Text>字母和数字</Text>
    <PinCode format="mixed" onComplete={(v) => console.log('pincode: ', v)} />
  </div>
  <div>
    <Text>只大写字母</Text>
    <PinCode format={/[A-Z]/} onComplete={(v) => console.log('pincode: ', v)} />
  </div>
  <div>
    <Text>只小写字母（函数判断）</Text>
    <PinCode format={(char) => /[a-z]/.test(char)} onComplete={(v) => console.log('pincode: ', v)} />
  </div>
</div>
