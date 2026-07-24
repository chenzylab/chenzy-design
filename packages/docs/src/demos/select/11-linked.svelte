<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const maps: Record<string, string[]> = {
    四川: ['成都', '都江堰'],
    广东: ['广州', '深圳', '东莞'],
  };
  const provinces = Object.keys(maps);

  let province = $state<string>(provinces[0]);
  let city = $state<string>(maps[provinces[0]][0]);

  const provinceChange = (newProvince: string | number | unknown) => {
    province = newProvince as string;
    city = maps[province][0];
  };

  const provinceOptions = provinces.map((p) => ({ value: p, label: p }));
  const cityOptions = $derived(maps[province].map((c) => ({ value: c, label: c })));
</script>

<Select style="width: 150px; margin: 10px" onChange={provinceChange} value={province} optionList={provinceOptions} />
<Select style="width: 150px; margin: 10px" value={city} onChange={(v) => (city = v as string)} optionList={cityOptions} />
