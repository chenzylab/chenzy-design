import Image_ from './Image.svelte';
import ImagePreview from './ImagePreview.svelte';
import ImagePreviewGroup from './ImagePreviewGroup.svelte';

export const Image: typeof Image_ & {
  Preview: typeof ImagePreview;
  PreviewGroup: typeof ImagePreviewGroup;
} = Object.assign(Image_, { Preview: ImagePreview, PreviewGroup: ImagePreviewGroup });

export { ImagePreview, ImagePreviewGroup };
export { meta as imageMeta } from './meta.js';
export {
  getImageGroupContext,
  setImageGroupContext,
  type ImageGroupContext,
  type PreviewItem,
} from './context.js';
