import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addWalletAddress, setActiveTab } from "../store/graphSlice";
import TransactionList from "./TransactionList";

const Sidebar = () => {
  const dispatch = useDispatch();
  const [newAddress, setNewAddress] = useState("");
  const activeTab = useSelector((state) => state.graph.activeTab);
  const inflows = useSelector((state) => state.graph.inflows);
  const outflows = useSelector((state) => state.graph.outflows);

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      dispatch(addWalletAddress(newAddress.trim()));
      setNewAddress("");
    }
  };

  return (
    <div className="w-72 h-full border-r dark:border-gray-700 dark:bg-gray-900 bg-white flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">
          Add Wallet Address:
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter wallet address"
            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <button
            onClick={handleAddAddress}
            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            ADD
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "inflows"
                ? "border-b-2 border-yellow-500 font-medium"
                : "text-gray-500"
            } dark:text-white`}
            onClick={() => dispatch(setActiveTab("inflows"))}
          >
            INFLOWS
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "outflows"
                ? "border-b-2 border-yellow-500 font-medium"
                : "text-gray-500"
            } dark:text-white`}
            onClick={() => dispatch(setActiveTab("outflows"))}
          >
            OUTFLOWS
          </button>
        </div>

        <div className="p-4">
          {activeTab === "inflows" ? (
            <TransactionList transactions={inflows} type="inflow" />
          ) : (
            <TransactionList transactions={outflows} type="outflow" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
