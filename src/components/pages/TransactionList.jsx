import { useDispatch } from "react-redux";
import { highlightNode } from "../store/graphSlice";

const TransactionList = ({ transactions, type }) => {
  const dispatch = useDispatch();

  if (!transactions || transactions.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No transactions to display
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => {
        const address =
          type === "inflow" ? tx.beneficiary_address : tx.payer_address;
        const entityName = tx.entity_name;
        const amount = tx.amount;

        return (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => dispatch(highlightNode(address))}
          >
            <div>
              <div className="font-medium text-sm dark:text-white">
                {entityName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                {address}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium dark:text-white">
                {amount.toFixed(8)} BTC
              </span>
              <div
                className={`w-3 h-3 rounded-full ml-2 ${
                  entityName === "Unknown"
                    ? "bg-gray-400"
                    : entityName === "Changenow"
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
