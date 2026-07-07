import Title from './Title.svelte';
import Text from './Text.svelte';
import Paragraph from './Paragraph.svelte';
import Link from './Link.svelte';
import Numeral from './Numeral.svelte';

export { Title, Text, Paragraph, Link, Numeral };

/** Aggregated namespace export: <Typography.Title /> etc. */
export const Typography: {
  Title: typeof Title;
  Text: typeof Text;
  Paragraph: typeof Paragraph;
  Link: typeof Link;
  Numeral: typeof Numeral;
} = { Title, Text, Paragraph, Link, Numeral };

export { meta as typographyMeta } from './meta.js';
