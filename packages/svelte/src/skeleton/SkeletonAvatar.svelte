<!--
  SkeletonAvatar — 头像占位块，镜像 Semi Skeleton.Avatar（item.tsx generator('avatar')）。
  尺寸由 size 类（6 档）决定，形状由 shape 类决定；circle → border-radius:50%。
  样式在 Skeleton.svelte 以 :global 全局定义（含 active 后代选择器），本组件只出裸 DOM。
-->
<script lang="ts">
  export type SkeletonAvatarSize =
    | 'extra-extra-small'
    | 'extra-small'
    | 'small'
    | 'medium'
    | 'large'
    | 'extra-large';
  export type SkeletonAvatarShape = 'circle' | 'square';

  interface Props {
    /** 头像大小，对齐 Semi 6 档，默认 medium。 */
    size?: SkeletonAvatarSize;
    /** 头像形状，对齐 Semi，默认 circle。 */
    shape?: SkeletonAvatarShape;
    class?: string;
    style?: string;
  }

  let { size = 'medium', shape = 'circle', class: className, style }: Props = $props();

  const cls = $derived(
    [
      'cd-skeleton-avatar',
      `cd-skeleton-avatar-${size}`,
      `cd-skeleton-avatar-${shape}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} {style}></div>
