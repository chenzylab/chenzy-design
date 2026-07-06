import CardComponent from './Card.svelte';
import CardMeta from './CardMeta.svelte';
import CardGroupComponent from './CardGroup.svelte';

const Card = Object.assign(CardComponent, {
  Meta: CardMeta,
  Group: CardGroupComponent,
});

export { Card };
export { CardMeta };
export { default as CardGroup } from './CardGroup.svelte';
export { meta as cardMeta, cardGroupMeta } from './meta.js';
