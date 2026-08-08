/**
 * Global color palette — raw atomic values, no semantics.
 * Component code must NEVER reference these directly; consume Alias tokens instead.
 * See specs/00-foundation/tokens.spec.md.
 *
 * Values are the real Semi Design palette (0 lightest → 9 darkest), captured
 * from the Semi Design reference. The library targets 100% Semi color parity;
 * note grey-0 is #f9f9f9 (not pure white) per Semi.
 */
export const palette = {
  // Neutral / grey scale (0 lightest → 9 darkest)
  'grey-0': '#f9f9f9',
  'grey-1': '#e6e8ea',
  'grey-2': '#c6cacd',
  'grey-3': '#a7abb0',
  'grey-4': '#888d92',
  'grey-5': '#6b7075',
  'grey-6': '#555b61',
  'grey-7': '#41464c',
  'grey-8': '#2e3238',
  'grey-9': '#1c1f23',
  // Brand blue
  'blue-0': '#eaf5ff',
  'blue-1': '#cbe7fe',
  'blue-2': '#98cdfd',
  'blue-3': '#65b2fc',
  'blue-4': '#3295fb',
  'blue-5': '#0064fa',
  'blue-6': '#0062d6',
  'blue-7': '#004fb3',
  'blue-8': '#003d8f',
  'blue-9': '#002c6b',
  // Green (success)
  'green-0': '#ecf7ec',
  'green-1': '#d0f0d1',
  'green-2': '#a4e0a7',
  'green-3': '#7dd182',
  'green-4': '#5ac262',
  'green-5': '#3bb346',
  'green-6': '#30953b',
  'green-7': '#25772f',
  'green-8': '#1b5924',
  'green-9': '#113c18',
  // Red (danger)
  'red-0': '#fef2ed',
  'red-1': '#feddd2',
  'red-2': '#fdb7a5',
  'red-3': '#fb9078',
  'red-4': '#fa664c',
  'red-5': '#f93920',
  'red-6': '#d52515',
  'red-7': '#b2140c',
  'red-8': '#8e0805',
  'red-9': '#6a0103',
  // Orange (warning) — Semi's warning ramp is orange, not yellow
  'orange-0': '#fff8ea',
  'orange-1': '#feeecc',
  'orange-2': '#fed998',
  'orange-3': '#fdc165',
  'orange-4': '#fda633',
  'orange-5': '#fc8800',
  'orange-6': '#d26700',
  'orange-7': '#a84a00',
  'orange-8': '#7e3100',
  'orange-9': '#541d00',
  // Yellow — 镜像 Semi yellow ramp（Rating 星色 yellow-5 用；warning 走 orange，二者独立）
  'yellow-0': '#fffdea',
  'yellow-1': '#fefbcb',
  'yellow-2': '#fdf398',
  'yellow-3': '#fce865',
  'yellow-4': '#fbda32',
  'yellow-5': '#fac800',
  'yellow-6': '#d0aa00',
  'yellow-7': '#a78b00',
  'yellow-8': '#7d6a00',
  'yellow-9': '#534800',
  // —— Semi 扩展色系（Avatar 语义色板消费；0-9 全档镜像 Semi _palette.scss 亮色段）——
  // Amber
  'amber-0': '#fefbeb',
  'amber-1': '#fcf5ce',
  'amber-2': '#f9e89e',
  'amber-3': '#f6d86f',
  'amber-4': '#f3c641',
  'amber-5': '#f0b114',
  'amber-6': '#c88a0f',
  'amber-7': '#a0660a',
  'amber-8': '#784606',
  'amber-9': '#502b03',
  // Cyan
  'cyan-0': '#e5f7f8',
  'cyan-1': '#c2eff0',
  'cyan-2': '#8adde2',
  'cyan-3': '#58cbd3',
  'cyan-4': '#2cb8c5',
  'cyan-5': '#05a4b6',
  'cyan-6': '#038698',
  'cyan-7': '#016979',
  'cyan-8': '#004d5b',
  'cyan-9': '#00323d',
  // Indigo
  'indigo-0': '#eceff8',
  'indigo-1': '#d1d8f0',
  'indigo-2': '#a7b3e1',
  'indigo-3': '#8090d3',
  'indigo-4': '#5e6fc4',
  'indigo-5': '#3f51b5',
  'indigo-6': '#3342a1',
  'indigo-7': '#28348c',
  'indigo-8': '#1f2878',
  'indigo-9': '#171d63',
  // Light Blue
  'light-blue-0': '#e9f7fd',
  'light-blue-1': '#c9ecfc',
  'light-blue-2': '#95d8f8',
  'light-blue-3': '#62c3f5',
  'light-blue-4': '#30acf1',
  'light-blue-5': '#0095ee',
  'light-blue-6': '#007bca',
  'light-blue-7': '#0063a7',
  'light-blue-8': '#004b83',
  'light-blue-9': '#00355f',
  // Light Green
  'light-green-0': '#f3f8ec',
  'light-green-1': '#e3f0d0',
  'light-green-2': '#c8e2a5',
  'light-green-3': '#add37e',
  'light-green-4': '#93c55b',
  'light-green-5': '#7bb63c',
  'light-green-6': '#649830',
  'light-green-7': '#4e7926',
  'light-green-8': '#395b1b',
  'light-green-9': '#253d12',
  // Lime
  'lime-0': '#f2fae6',
  'lime-1': '#e3f6c5',
  'lime-2': '#cbed8e',
  'lime-3': '#b7e35b',
  'lime-4': '#a7da2c',
  'lime-5': '#9bd100',
  'lime-6': '#7eae00',
  'lime-7': '#638b00',
  'lime-8': '#486800',
  'lime-9': '#2f4600',
  // Pink
  'pink-0': '#fdecef',
  'pink-1': '#fbcfd8',
  'pink-2': '#f6a0b5',
  'pink-3': '#f27396',
  'pink-4': '#ed487b',
  'pink-5': '#e91e63',
  'pink-6': '#c51356',
  'pink-7': '#a20b48',
  'pink-8': '#7e053a',
  'pink-9': '#5a012b',
  // Purple
  'purple-0': '#f7e9f7',
  'purple-1': '#efcaf0',
  'purple-2': '#dd9be0',
  'purple-3': '#c96fd1',
  'purple-4': '#b449c2',
  'purple-5': '#9e28b3',
  'purple-6': '#871e9e',
  'purple-7': '#71168a',
  'purple-8': '#5c0f75',
  'purple-9': '#490a61',
  // Teal
  'teal-0': '#e4f7f4',
  'teal-1': '#c0f0e8',
  'teal-2': '#87e0d3',
  'teal-3': '#54d1c1',
  'teal-4': '#27c2b0',
  'teal-5': '#00b3a1',
  'teal-6': '#009589',
  'teal-7': '#00776f',
  'teal-8': '#005955',
  'teal-9': '#003c3a',
  // Violet
  'violet-0': '#f3edf9',
  'violet-1': '#e2d1f4',
  'violet-2': '#c4a7e9',
  'violet-3': '#a67fdd',
  'violet-4': '#885bd2',
  'violet-5': '#6a3ac7',
  'violet-6': '#572fb3',
  'violet-7': '#46259e',
  'violet-8': '#361c8a',
  'violet-9': '#281475',
  // 纯黑/纯白基元（对齐 Semi $white / $black = 255,255,255 / 0,0,0，供反色文字等直接消费）
  // —— AI purple（镜像 Semi --semi-ai-purple-0..9）——
  'ai-purple-0': '#f8edff',
  'ai-purple-1': '#f2daff',
  'ai-purple-2': '#e3b5ff',
  'ai-purple-3': '#d191ff',
  'ai-purple-4': '#bd6cff',
  'ai-purple-5': '#a647ff',
  'ai-purple-6': '#8636db',
  'ai-purple-7': '#6928b8',
  'ai-purple-8': '#4e1c94',
  'ai-purple-9': '#361270',
  // —— AI general 渐变停靠点（镜像 Semi --semi-ai-general-<档>-<停靠点>）——
  // 档 0
  'ai-general-0-0': '#fff2ff',
  'ai-general-0-1': '#f8edff',
  'ai-general-0-2': '#f4f4ff',
  'ai-general-0-3': '#eff7ff',
  // 档 1
  'ai-general-1-0': '#ffdafe',
  'ai-general-1-1': '#f2daff',
  'ai-general-1-2': '#dfe0ff',
  'ai-general-1-3': '#d5ebff',
  // 档 2
  'ai-general-2-0': '#feb5ff',
  'ai-general-2-1': '#e3b5ff',
  'ai-general-2-2': '#c1c0ff',
  'ai-general-2-3': '#abd5ff',
  // 档 3
  'ai-general-3-0': '#f98fff',
  'ai-general-3-1': '#d191ff',
  'ai-general-3-2': '#a3a0ff',
  'ai-general-3-3': '#82beff',
  // 档 4
  'ai-general-4-0': '#f26aff',
  'ai-general-4-1': '#bd6cff',
  'ai-general-4-2': '#8681ff',
  'ai-general-4-3': '#58a6ff',
  // 档 5
  'ai-general-5-0': '#e945ff',
  'ai-general-5-1': '#a647ff',
  'ai-general-5-2': '#6b61ff',
  'ai-general-5-3': '#2e8cff',
  // 档 6
  'ai-general-6-0': '#c235db',
  'ai-general-6-1': '#8636db',
  'ai-general-6-2': '#584ddb',
  'ai-general-6-3': '#2172db',
  // 档 7
  'ai-general-7-0': '#9d27b8',
  'ai-general-7-1': '#6928b8',
  'ai-general-7-2': '#473bb8',
  'ai-general-7-3': '#1659b8',
  // 档 8
  'ai-general-8-0': '#791b94',
  'ai-general-8-1': '#4e1c94',
  'ai-general-8-2': '#372b94',
  'ai-general-8-3': '#0d4394',
  // 档 9
  'ai-general-9-0': '#581170',
  'ai-general-9-1': '#361270',
  'ai-general-9-2': '#281d70',
  'ai-general-9-3': '#072f70',
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
} as const;

export type GlobalColorKey = keyof typeof palette;

/**
 * AI general 渐变档位 —— 镜像 Semi `--semi-ai-general-0..9`（_palette.scss:227-236）。
 *
 * Semi 把它拆成两层：先有 4 个停靠点 `ai-general-<档>-<0..3>`，再由它们
 * **组合**出该档的 `linear-gradient`；语义色 `--semi-color-ai-general` 再指向 `ai-general-5`。
 * 本库此前把三层压成一条写死的 gradient 字面量，主题定制无法改其中任何一档。
 * 这里补回中间层：值是引用停靠点变量的 gradient，与 Semi 同构。
 *
 * 角度 278deg 与 0/30/60/100% 的停靠比例均照抄 Semi。
 */
const AI_GENERAL_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const aiGeneralGradients = Object.fromEntries(
  AI_GENERAL_STEPS.map((n) => [
    `ai-general-${n}`,
    `linear-gradient(278deg, var(--cd-color-ai-general-${n}-0) 0%, var(--cd-color-ai-general-${n}-1) 30%, var(--cd-color-ai-general-${n}-2) 60%, var(--cd-color-ai-general-${n}-3) 100%)`,
  ]),
) as Record<`ai-general-${(typeof AI_GENERAL_STEPS)[number]}`, string>;

/**
 * 一条「指向色板的引用」，而不是把色值抄一份。
 *
 * ## 为什么必须是引用
 *
 * Semi 的语义色是 `--semi-color-primary: rgba(var(--semi-blue-5), 1)` —— 运行时
 * **真的**指向色板变量。所以用户覆盖 `--semi-blue-5` 时，primary 及其所有下游会跟着变，
 * 这正是「换一个品牌色即换肤」的机制。
 *
 * 本库此前写 `'color-primary': palette['blue-5']`，TS 里看着是引用，
 * 但那是**取值**——构建后产物是 `--cd-color-primary: #0064fa`，引用关系在编译期就没了。
 * 实测（2026-07-31，本库文档站 + Semi 官网双侧验证）：
 *   覆盖 `--cd-color-blue-5` → 本库 `--cd-color-primary` **不动**；
 *   覆盖 `--semi-blue-5`     → Semi `--semi-color-primary` **跟随**。
 * 即本库的主题定制在语义层是断的，属真实功能缺陷而非记法差异。
 *
 * 用 `ref('blue-5')` 声明后，构建产物为 `var(--cd-color-blue-5)`，
 * 与 Semi 同构；`.value` 保留解析后的字面值，供对比度检查等需要真实色值的地方使用。
 */
export interface TokenRef {
  readonly __ref: GlobalColorKey;
  /** 解析后的 light 主题字面值（对比度检查等用）。 */
  readonly value: string;
  /** 构建期输出的 CSS 值。 */
  readonly css: string;
}

export function ref(key: GlobalColorKey): TokenRef {
  return {
    __ref: key,
    value: palette[key],
    css: `var(--cd-color-${key})`,
  };
}

/** 取一个「值或引用」的字面色值（引用则解析到对应主题色板）。 */
export function resolveRef(v: string | TokenRef, dark = false): string {
  if (typeof v === 'string') return v;
  if (!dark) return v.value;
  const dk = v.__ref as Exclude<GlobalColorKey, 'white' | 'black'>;
  return paletteDark[dk] ?? v.value;
}

/**
 * Dark-mode palette —— 对齐 Semi `body[theme-mode="dark"]` 的整套色阶反转
 * （semi-theme-default/scss/_palette.scss dark 块，rgb 三元组转 hex）。
 * dark 下 0 仍是「最贴近背景」、9 是「最远离背景」：数值序不变、明暗语义随主题翻转，
 * 组件按档位消费（如 light Tag 用 -5 15% 底 + -8 文字）即可两主题皆正确。
 * white / black 基元不反转（与 Semi 一致，dark 块不重定义 $white/$black）。
 */
export const paletteDark: Record<Exclude<GlobalColorKey, 'white' | 'black'>, string> = {
  'grey-0': '#1c1f23',
  'grey-1': '#2e3238',
  'grey-2': '#41464c',
  'grey-3': '#555b61',
  'grey-4': '#6b7075',
  'grey-5': '#888d92',
  'grey-6': '#a7abb0',
  'grey-7': '#c6cacd',
  'grey-8': '#e6e8ea',
  'grey-9': '#f9f9f9',
  'blue-0': '#053170',
  'blue-1': '#0a4694',
  'blue-2': '#135cb8',
  'blue-3': '#1d75db',
  'blue-4': '#2990ff',
  'blue-5': '#54a9ff',
  'blue-6': '#7fc1ff',
  'blue-7': '#a9d7ff',
  'blue-8': '#d4ecff',
  'blue-9': '#eff8ff',
  'green-0': '#123c19',
  'green-1': '#1c5a25',
  'green-2': '#277731',
  'green-3': '#32953d',
  'green-4': '#3eb349',
  'green-5': '#5dc264',
  'green-6': '#7fd184',
  'green-7': '#a6e1a8',
  'green-8': '#d0f0d1',
  'green-9': '#ecf7ec',
  'red-0': '#6c090b',
  'red-1': '#901110',
  'red-2': '#b42019',
  'red-3': '#d73324',
  'red-4': '#fb4932',
  'red-5': '#fc725a',
  'red-6': '#fd9983',
  'red-7': '#fdbeac',
  'red-8': '#fee0d5',
  'red-9': '#fff3ef',
  'orange-0': '#551f03',
  'orange-1': '#803506',
  'orange-2': '#aa500a',
  'orange-3': '#d56f0f',
  'orange-4': '#ff9214',
  'orange-5': '#ffae43',
  'orange-6': '#ffc772',
  'orange-7': '#ffdda1',
  'orange-8': '#ffefd0',
  'orange-9': '#fff9ed',
  'yellow-0': '#544903',
  'yellow-1': '#7e6c06',
  'yellow-2': '#a88e0a',
  'yellow-3': '#d2af0f',
  'yellow-4': '#fcce14',
  'yellow-5': '#fdde43',
  'yellow-6': '#fdeb71',
  'yellow-7': '#fef5a0',
  'yellow-8': '#fefbd0',
  'yellow-9': '#fffeec',
  'amber-0': '#512e09',
  'amber-1': '#794b0f',
  'amber-2': '#a16b16',
  'amber-3': '#ca8f1e',
  'amber-4': '#f2b726',
  'amber-5': '#f5ca50',
  'amber-6': '#f7db7a',
  'amber-7': '#faeaa6',
  'amber-8': '#fcf6d2',
  'amber-9': '#fefbed',
  'cyan-0': '#04343d',
  'cyan-1': '#074f5c',
  'cyan-2': '#0a6c7b',
  'cyan-3': '#0e8999',
  'cyan-4': '#13a8b8',
  'cyan-5': '#38bbc6',
  'cyan-6': '#62cdd4',
  'cyan-7': '#91dfe3',
  'cyan-8': '#c6eff1',
  'cyan-9': '#e7f7f8',
  'indigo-0': '#171e65',
  'indigo-1': '#20297a',
  'indigo-2': '#29368e',
  'indigo-3': '#3444a3',
  'indigo-4': '#4053b7',
  'indigo-5': '#5f71c5',
  'indigo-6': '#8191d4',
  'indigo-7': '#a7b4e2',
  'indigo-8': '#d1d8f1',
  'indigo-9': '#edeff8',
  'light-blue-0': '#003761',
  'light-blue-1': '#004d85',
  'light-blue-2': '#0366a9',
  'light-blue-3': '#0a81cc',
  'light-blue-4': '#139ff0',
  'light-blue-5': '#40b4f3',
  'light-blue-6': '#6ec8f6',
  'light-blue-7': '#9ddcf9',
  'light-blue-8': '#ceeefc',
  'light-blue-9': '#ebf8fe',
  'light-green-0': '#263d13',
  'light-green-1': '#3b5c1d',
  'light-green-2': '#517b28',
  'light-green-3': '#679934',
  'light-green-4': '#7fb840',
  'light-green-5': '#97c65f',
  'light-green-6': '#b0d481',
  'light-green-7': '#c9e3a7',
  'light-green-8': '#e4f1d1',
  'light-green-9': '#f3f8ed',
  'lime-0': '#314603',
  'lime-1': '#4b6905',
  'lime-2': '#678d09',
  'lime-3': '#84b00c',
  'lime-4': '#a2d311',
  'lime-5': '#aedc3a',
  'lime-6': '#bde566',
  'lime-7': '#cfed96',
  'lime-8': '#e5f6c9',
  'lime-9': '#f3fbe9',
  'pink-0': '#5c0730',
  'pink-1': '#800e41',
  'pink-2': '#a41751',
  'pink-3': '#c72261',
  'pink-4': '#eb2f71',
  'pink-5': '#ef5686',
  'pink-6': '#f37e9f',
  'pink-7': '#f7a8bc',
  'pink-8': '#fbd3dc',
  'pink-9': '#fdeef1',
  'purple-0': '#4a1061',
  'purple-1': '#5e1776',
  'purple-2': '#731f8a',
  'purple-3': '#89289f',
  'purple-4': '#a033b3',
  'purple-5': '#b553c2',
  'purple-6': '#ca78d1',
  'purple-7': '#dda0e1',
  'purple-8': '#efcef0',
  'purple-9': '#f7ebf7',
  'teal-0': '#023c39',
  'teal-1': '#045a55',
  'teal-2': '#07776f',
  'teal-3': '#0a9588',
  'teal-4': '#0eb3a1',
  'teal-5': '#33c2b0',
  'teal-6': '#5ed1c1',
  'teal-7': '#8ee1d3',
  'teal-8': '#c4f0e8',
  'teal-9': '#e6f7f4',
  'violet-0': '#401b77',
  'violet-1': '#4c248c',
  'violet-2': '#582ea0',
  'violet-3': '#6439b5',
  'violet-4': '#7246c9',
  'violet-5': '#8865d4',
  'violet-6': '#a288df',
  'violet-7': '#beade9',
  'violet-8': '#ddd4f4',
  'violet-9': '#f1eefa',
  // —— AI purple（镜像 Semi --semi-ai-purple-0..9）——
  'ai-purple-0': '#3a1770',
  'ai-purple-1': '#532394',
  'ai-purple-2': '#6f31b8',
  'ai-purple-3': '#8d41db',
  'ai-purple-4': '#a744ff',
  'ai-purple-5': '#c375ff',
  'ai-purple-6': '#d598ff',
  'ai-purple-7': '#e5baff',
  'ai-purple-8': '#f3ddff',
  'ai-purple-9': '#fbf3ff',
  // —— AI general 渐变停靠点（镜像 Semi --semi-ai-general-<档>-<停靠点>）——
  // 档 0
  'ai-general-0-0': '#092c64',
  'ai-general-0-1': '#271d6c',
  'ai-general-0-2': '#3a1770',
  'ai-general-0-3': '#501265',
  // 档 1
  'ai-general-1-0': '#114088',
  'ai-general-1-1': '#362b90',
  'ai-general-1-2': '#532394',
  'ai-general-1-3': '#711c89',
  // 档 2
  'ai-general-2-0': '#1a56ac',
  'ai-general-2-1': '#463bb4',
  'ai-general-2-2': '#6f31b8',
  'ai-general-2-3': '#9429ad',
  // 档 3
  'ai-general-3-0': '#266fcf',
  'ai-general-3-1': '#584ed7',
  'ai-general-3-2': '#8d41db',
  'ai-general-3-3': '#b937d0',
  // 档 4
  'ai-general-4-0': '#237ff0',
  'ai-general-4-1': '#5e54f8',
  'ai-general-4-2': '#a744ff',
  'ai-general-4-3': '#db38f1',
  // 档 5
  'ai-general-5-0': '#5ba2f5',
  'ai-general-5-1': '#8681fc',
  'ai-general-5-2': '#c375ff',
  'ai-general-5-3': '#ea6bf6',
  // 档 6
  'ai-general-6-0': '#83bbf8',
  'ai-general-6-1': '#a3a0fd',
  'ai-general-6-2': '#d598ff',
  'ai-general-6-3': '#f38ff8',
  // 档 7
  'ai-general-7-0': '#acd2fa',
  'ai-general-7-1': '#c0c0fd',
  'ai-general-7-2': '#e5baff',
  'ai-general-7-3': '#f9b4fb',
  // 档 8
  'ai-general-8-0': '#d5e9fd',
  'ai-general-8-1': '#dfdffe',
  'ai-general-8-2': '#f3ddff',
  'ai-general-8-3': '#fdd9fc',
  // 档 9
  'ai-general-9-0': '#eff7fe',
  'ai-general-9-1': '#f4f4ff',
  'ai-general-9-2': '#fbf3ff',
  'ai-general-9-3': '#fef1fe',
} as const;
