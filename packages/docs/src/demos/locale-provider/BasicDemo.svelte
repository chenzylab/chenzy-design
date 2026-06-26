<script lang="ts">
  import {
    LocaleProvider,
    zh_CN,
    en_US,
    registerLocale,
    Button,
    Empty,
    Pagination,
    TagInput,
    Text,
  } from '@chenzy-design/svelte';
  import type { Locale } from '@chenzy-design/svelte';

  let localeIsZh = $state(true);
  let tagsI18n = $state<string[]>(['svelte', 'i18n']);

  registerLocale('fr_FR', {
    ...en_US,
    code: 'fr-FR',
    Modal: { okText: 'Confirmer', cancelText: 'Annuler', close: 'Fermer' },
  });
  let localeCode = $state<'zh_CN' | 'en_US' | 'fr_FR'>('zh_CN');
</script>

<Button onclick={() => (localeIsZh = !localeIsZh)}>切换语言：{localeIsZh ? '中文' : 'English'}</Button>
<div style="margin-top:8px">
  <LocaleProvider locale={localeIsZh ? zh_CN : en_US}>
    {#snippet children({ locale, t, formatNumber, direction })}
      <div style="line-height:2">
        <div>生效 locale：<strong>{locale}</strong>（方向 {direction}）</div>
        <div>Modal.okText：<strong>{t('Modal.okText')}</strong> / Modal.cancelText：<strong>{t('Modal.cancelText')}</strong></div>
        <div>Pagination.total：<strong>{t('Pagination.total', { total: 1234 })}</strong></div>
        <div>格式化数字 1234567.89：<strong>{formatNumber(1234567.89)}</strong></div>
      </div>
    {/snippet}
  </LocaleProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">下列组件被同一 LocaleProvider 包裹，其内部文案应随上方语言切换：</Text>
  <LocaleProvider locale={localeIsZh ? zh_CN : en_US}>
    <div style="margin-top:8px; max-width:420px">
      <Empty />
      <div style="margin-top:8px">
        <Pagination total={1234} showTotal currentPage={1} pageSize={10} />
      </div>
      <div style="margin-top:8px">
        <TagInput value={tagsI18n} onChange={(t) => (tagsI18n = t)} />
      </div>
    </div>
  </LocaleProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">字符串码解析（内置 zh_CN/en_US + registerLocale 注册的 fr_FR）：</Text>
  <div style="margin-top:8px; display:flex; gap:8px">
    <Button size="small" onclick={() => (localeCode = 'zh_CN')}>zh_CN</Button>
    <Button size="small" onclick={() => (localeCode = 'en_US')}>en_US</Button>
    <Button size="small" onclick={() => (localeCode = 'fr_FR')}>fr_FR（自定义）</Button>
  </div>
  <LocaleProvider locale={localeCode}>
    {#snippet children({ locale, t })}
      <div style="margin-top:8px; line-height:2">
        <div>locale 码 <strong>"{localeCode}"</strong> → 生效 <strong>{locale}</strong></div>
        <div>Modal.okText：<strong>{t('Modal.okText')}</strong></div>
      </div>
    {/snippet}
  </LocaleProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">嵌套 inherit 深合并：外层 zh_CN，内层仅覆盖 Modal.okText，其余继承外层。</Text>
  <LocaleProvider locale="zh_CN">
    <LocaleProvider locale={{ Modal: { okText: '好的（覆盖）' } } as unknown as Locale}>
      {#snippet children({ locale, t })}
        <div style="margin-top:8px; line-height:2">
          <div>生效 locale：<strong>{locale}</strong>（继承外层）</div>
          <div>Modal.okText（覆盖）：<strong>{t('Modal.okText')}</strong></div>
          <div>Modal.cancelText（继承）：<strong>{t('Modal.cancelText')}</strong></div>
        </div>
      {/snippet}
    </LocaleProvider>
  </LocaleProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">timeZone / currency：注入 formatDate / currency 风格 formatNumber。</Text>
  <LocaleProvider locale="zh_CN" timeZone="Asia/Shanghai" currency="CNY">
    {#snippet children({ formatDate, formatNumber })}
      <div style="margin-top:8px; line-height:2">
        <div>UTC 2026-01-01T00:00 在 Asia/Shanghai：<strong>{formatDate(new Date(Date.UTC(2026, 0, 1, 0, 0)), { hour: '2-digit', minute: '2-digit', hour12: false })}</strong></div>
        <div>货币 1234.5（默认 CNY）：<strong>{formatNumber(1234.5, { style: 'currency' })}</strong></div>
      </div>
    {/snippet}
  </LocaleProvider>
</div>
