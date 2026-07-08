<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  const candidates = ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Qwik', 'Preact'];

  let tags = $state<string[]>(['Svelte']);

  function filter(input: string): string[] {
    const kw = input.trim().toLowerCase();
    if (kw === '') return [];
    return candidates.filter(
      (c) => c.toLowerCase().includes(kw) && !tags.includes(c),
    );
  }
</script>

<div style="width: 360px">
  <TagInput
    value={tags}
    placeholder="输入框架名，如 v、re…"
    onChange={(t) => (tags = t)}
  >
    {#snippet renderSuggestions({ inputValue, add, close })}
      {@const matched = filter(inputValue)}
      {#if matched.length === 0}
        <div class="suggest-empty">
          <Text type="tertiary" size="small">无匹配建议</Text>
        </div>
      {:else}
        <ul class="suggest-list">
          {#each matched as item (item)}
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
            <li
              class="suggest-item"
              onclick={() => {
                add(item);
                close();
              }}
            >
              {item}
            </li>
          {/each}
        </ul>
      {/if}
    {/snippet}
  </TagInput>
  <Text type="tertiary">已选：{tags.join(' / ') || '（无）'}</Text>
</div>

<style>
  .suggest-list {
    margin: 0;
    padding: 4px;
    list-style: none;
  }
  .suggest-item {
    padding: 6px 10px;
    border-radius: var(--cd-input-radius, 6px);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.12s ease;
  }
  .suggest-item:hover {
    background: var(--cd-color-fill-1, rgba(0, 0, 0, 0.06));
  }
  .suggest-empty {
    padding: 8px 10px;
  }
</style>
