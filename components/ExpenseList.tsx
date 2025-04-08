import { IExpenseLocal } from "@/models/Expense";
import { Group } from "./Group";
import { useActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { Expense } from "./Expense";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { getCategoryById } from "@/lib/localDatabaseUtils";

type TExpenseListProps = {
  title?: string | boolean;
  expenses: IExpenseLocal[];
};

export function ExpenseList({ title, expenses }: TExpenseListProps) {
  const { categories } = useLocalDatabaseContext();
  const { setActiveDrawer } = useActiveDrawerContext();

  return (
    expenses.length > 0 && (
      <Group title={title} className="flex flex-col" largeTitle>
        {expenses.map((expense, index) => (
          <Expense
            key={index}
            expense={expense}
            category={getCategoryById(categories, expense.categoryId)}
            onClick={() =>
              setActiveDrawer({ type: "expense", editItemId: expense._id })
            }
            groupSize={expenses.length}
          />
        ))}
      </Group>
    )
  );
}
