<script lang="ts">
  import { onMount } from 'svelte';
  import { CodeHighlight } from '@chenzy-design/svelte';
  // prismjs 内置 JavaScript / CSS / 类 C / html / svg，其余语言需手动引入配置。
  // 例如高亮用于编写 GTK 程序前端 UI 的 Vala 语言，需引入 prism-vala.js。
  // docs 为 SSR，prism 语言组件是依赖全局 Prism 的副作用脚本，只能在客户端加载
  // （SSR 顶层 import 会 `Cannot find module` 崩），故在 onMount 里动态引入后再挂载。
  let ready = $state(false);
  onMount(async () => {
    await import('prismjs/components/prism-vala.js');
    ready = true;
  });

  const code = `public class ExampleApp : Gtk.Application {
    public ExampleApp () {
        Object (application_id: "com.example.App");
    }

    public override void activate () {
        var win = new Gtk.ApplicationWindow (this);

        var btn = new Gtk.Button.with_label ("Hello World");
        btn.clicked.connect (win.close);

        win.child = btn;
        win.present ();
    }

    public static int main (string[] args) {
        var app = new ExampleApp ();
        return app.run (args);
    }
}`;
</script>

{#if ready}
  <CodeHighlight language="vala" {code} />
{/if}
