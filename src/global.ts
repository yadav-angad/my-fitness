 
 export interface Category {
    key: CategoryKey;
    label: string;
    color: string;
};

export interface Expense {
    id: number;
    expenseName: string;
    amount: number;
    expenseType: CategoryKey;
    createdDate: Date;
};

export interface GroupedExpenses {
    key: string; // date in MM-DD-YYYY format
    value: Expense[];
}

export const CATEGORIES: Category[] = [
  {
    key: "food",
    label: "Food",
    color: "#FF9800", // Orange → appetite, meals
  },
  {
    key: "utilities",
    label: "Utilities",
    color: "#2196F3", // Blue → movement, travel, trust
  },
  {
    key: "shopping",
    label: "Shopping",
    color: "#9C27B0", // Purple → fun, leisure, creativity
  },
  {
    key: "travel",
    label: "Travel",
    color: "#4CAF50", // Green → nature, trips, outdoors
  },
  {
    key: "other",
    label: "Other",
    color: "#9E9E9E", // Grey → neutral / uncategorized
  },
];
