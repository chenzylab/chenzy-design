<script lang="ts">
  import { AutoComplete, Empty, IllustrationNoContent } from '@chenzy-design/svelte';

  let data = $state<number[]>([]);
  let loading = $state(false);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const fetchData = (v: string) => {
    clearTimeout(timer);
    loading = true;
    timer = setTimeout(() => {
      data = v ? Array.from({ length: 5 }, (_, i) => i) : [];
      loading = false;
    }, 1000);
  };
</script>

<AutoComplete {loading} {data} onSearch={fetchData} style="width: 250px">
  {#snippet emptyContent()}
    <Empty style="padding: 12px; width: 300px" description="暂无内容">
      {#snippet imageSlot()}
        <IllustrationNoContent style="width: 150px; height: 150px" />
      {/snippet}
    </Empty>
  {/snippet}
</AutoComplete>
