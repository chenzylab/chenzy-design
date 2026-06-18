import '@chenzy-design/tokens/tokens.css';
import 'uno.css';
import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('app')!;
mount(App, { target });
