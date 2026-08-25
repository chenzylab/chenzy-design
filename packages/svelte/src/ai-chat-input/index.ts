import AIChatInput_ from './AIChatInput.svelte';
import AIChatInputConfigureSelect from './AIChatInputConfigureSelect.svelte';
import AIChatInputConfigureButton from './AIChatInputConfigureButton.svelte';
import AIChatInputConfigureRadioButton from './AIChatInputConfigureRadioButton.svelte';
import AIChatInputConfigureMcp from './AIChatInputConfigureMcp.svelte';
import AIChatInputConfigureItem from './AIChatInputConfigureItem.svelte';
import { getCustomSlotAttribute } from '@chenzy-design/core';
export { getConfigureItem, type GetConfigureItemOptions } from './get-configure-item.svelte.js';

// AIChatInput 挂载 Configure 命名空间（对齐 Semi AIChatInput.Configure = {Select,Button,Mcp,RadioButton}）。
// Semi 无 .Item：getConfigureItem 是单独具名导出的工厂函数（同样单独导出，见上）；
// .Item（AIChatInputConfigureItem）是本库另加的 render-prop 形态——同样能把任意受控组件接入
// 配置区 context，写在模板里更顺手（不必先在 <script> 里调用工厂函数生成组件）。两者并存，
// 用户按场景选：模板里就地包装用 .Item，需要生成可复用组件用 getConfigureItem。
// getCustomSlotAttribute 挂静态方法（对齐 Semi AIChatInput.getCustomSlotAttribute），
// 供用户自定义 tiptap 扩展的 isCustomSlot 属性声明复用（如文档「自定义扩展」章节的
// AddPasteRule demo）。
export const AIChatInput: typeof AIChatInput_ & {
  Configure: {
    Select: typeof AIChatInputConfigureSelect;
    Button: typeof AIChatInputConfigureButton;
    RadioButton: typeof AIChatInputConfigureRadioButton;
    Mcp: typeof AIChatInputConfigureMcp;
    Item: typeof AIChatInputConfigureItem;
  };
  getCustomSlotAttribute: typeof getCustomSlotAttribute;
} = Object.assign(AIChatInput_, {
  Configure: {
    Select: AIChatInputConfigureSelect,
    Button: AIChatInputConfigureButton,
    RadioButton: AIChatInputConfigureRadioButton,
    Mcp: AIChatInputConfigureMcp,
    Item: AIChatInputConfigureItem,
  },
  getCustomSlotAttribute,
});

export {
  AIChatInputConfigureSelect,
  AIChatInputConfigureButton,
  AIChatInputConfigureRadioButton,
  AIChatInputConfigureMcp,
  AIChatInputConfigureItem,
  getCustomSlotAttribute,
};
export { meta as aiChatInputMeta } from './meta.js';
// headless 逻辑与类型从 core 透传，供消费方直接从 svelte 包使用。
export {
  isSendHotKey,
  resolveCanSend,
  buildMessageContent,
  transformDocToContents,
  suggestionContent,
  nextSuggestionIndex,
  referenceLabel,
  isImageReference,
  skillLabel,
  getSkillSlotHTML,
  getSelectSlotHTML,
  getInputSlotHTML,
  AI_CHAT_INPUT_ZERO_WIDTH,
  shouldOpenSkillPanel,
  setConfigureField,
  removeConfigureField,
  messageToChatInput,
  chatInputToChatCompletion,
  type AIChatInputContent,
  type AIChatInputAttachment,
  type AIChatInputReference,
  type AIChatInputMessageContent,
  type AIChatInputSendHotKey,
  type AIChatInputChangePayload,
  type AIChatInputSuggestion,
  type AIChatInputSkill,
  type AIChatInputConfigureValue,
  type ChatCompletionInputMessage,
} from '@chenzy-design/core';
