import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addWalletAddress, setActiveTab } from "../store/graphSlice";
import TransactionList from "./TransactionList";
import { XIcon } from "../icons";

const Sidebar = ({ onClose }) => {
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
    <div className="w-80 h-full border-r dark:border-gray-700 dark:bg-gray-900 bg-white flex flex-col shadow-lg">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold dark:text-white">
          Add Wallet Address:
        </h2>
        {/* Close button for mobile */}
        <button
          className="md:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <XIcon className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      <div className="p-4 border-b dark:border-gray-700">
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
