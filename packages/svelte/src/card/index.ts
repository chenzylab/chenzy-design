import CardComponent from './Card.svelte';
import CardMeta from './CardMeta.svelte';

const Card = Object.assign(CardComponent, { Meta: CardMeta });

export { Card };
export { CardMeta };
export { meta as cardMeta } from './meta.js';
