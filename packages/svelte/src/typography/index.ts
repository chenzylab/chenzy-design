import Title from './Title.svelte';
import Text from './Text.svelte';
import Paragraph from './Paragraph.svelte';
import Link from './Link.svelte';

export { Title, Text, Paragraph, Link };

/** Aggregated namespace export: <Typography.Title /> etc. */
export const Typography: {
  Title: typeof Title;
  Text: typeof Text;
  Paragraph: typeof Paragraph;
  Link: typeof Link;
} = { Title, Text, Paragraph, Link };

export { meta as typographyMeta } from './meta.js';
