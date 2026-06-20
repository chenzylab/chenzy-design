import Image_ from './Image.svelte';
import ImagePreviewGroup from './ImagePreviewGroup.svelte';

export const Image: typeof Image_ & {
  PreviewGroup: typeof ImagePreviewGroup;
} = Object.assign(Image_, { PreviewGroup: ImagePreviewGroup });

export { ImagePreviewGroup };
export { meta as imageMeta } from './meta.js';
export {
  getImageGroupContext,
  setImageGroupContext,
  type ImageGroupContext,
  type PreviewItem,
} from './context.js';
