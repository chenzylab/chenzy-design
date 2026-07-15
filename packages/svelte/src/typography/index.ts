import Title from './Title.svelte';
import Text from './Text.svelte';
import Paragraph from './Paragraph.svelte';
import Numeral from './Numeral.svelte';

export { Title, Text, Paragraph, Numeral };

/** Aggregated namespace export: <Typography.Title /> etc. */
export const Typography: {
  Title: typeof Title;
  Text: typeof Text;
  Paragraph: typeof Paragraph;
  Numeral: typeof Numeral;
} = { Title, Text, Paragraph, Numeral };

export { meta as typographyMeta } from './meta.js';
