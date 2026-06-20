export interface TransferItem {
  key: string | number;
  label: string;
  disabled?: boolean;
  /** Optional group name; items sharing a group render under one group header. */
  group?: string;
}

/** Grouped data source: each group renders a header + its items. */
export interface TransferGroup {
  /** Group title shown as the group header. */
  title: string;
  items: TransferItem[];
}

/** A computed group used for rendering one panel side. */
export interface TransferRenderGroup {
  title: string;
  items: TransferItem[];
}
