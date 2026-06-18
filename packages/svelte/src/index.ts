/**
 * @chenzy-design/svelte — Svelte 5 component implementations.
 * Each component is its own entry for tree-shaking.
 */
export { Button, buttonMeta } from './button/index.js';
export { Icon, iconMeta } from './icon/index.js';
export { Divider, dividerMeta } from './divider/index.js';
export { Space, spaceMeta } from './space/index.js';
export {
  Typography,
  Title,
  Text,
  Paragraph,
  Link,
  typographyMeta,
} from './typography/index.js';
export { Row, Col, gridMeta } from './grid/index.js';
export {
  Layout,
  LayoutHeader,
  LayoutFooter,
  LayoutContent,
  LayoutSider,
  layoutMeta,
} from './layout/index.js';

// --- M2 Input ---
export { Input, inputMeta } from './input/index.js';
export { Textarea, textareaMeta } from './textarea/index.js';
export { Switch, switchMeta } from './switch/index.js';
export { Checkbox, CheckboxGroup, checkboxMeta } from './checkbox/index.js';
export { Radio, RadioGroup, radioMeta } from './radio/index.js';
export { InputNumber, inputNumberMeta } from './input-number/index.js';
export { Rating, ratingMeta } from './rating/index.js';
export { Slider, sliderMeta } from './slider/index.js';
export { Form, FormField, FormInput, formMeta } from './form/index.js';
