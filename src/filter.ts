export const FilterType = {
  StringFilterType: [
    "contains",
    "equals",
    "starts With",
    "ends With",
    "is empty",
    "is not empty",
    "is any of ",
  ] as const,
  DateFilterType: [
    "is",
    "is not",
    "is after",
    "is on or after",
    "is before",
    "is on or before",
    "is empty",
    "is not empty",
  ] as const,
  BooleanFilterType: ["is"] as const,
};
