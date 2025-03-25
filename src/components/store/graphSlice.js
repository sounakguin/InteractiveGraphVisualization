import { createSlice } from "@reduxjs/toolkit";
import inflowData from "../data/inflow.json";
import outflowData from "../data/outflow.json";

// Initial search address
const INITIAL_SEARCH_ADDRESS = "bc1q6nxdnz58kexp48sm2t3scwqcw9stt7r8s7uuwn";

// Process data and create graph structure
const processData = (searchAddress) => {
  const inflows = inflowData.data || [];
  const outflows = outflowData.data || [];

  // Create nodes map to avoid duplicates
  const nodesMap = new Map();

  // Add main node (search address)
  nodesMap.set(searchAddress, {
    id: searchAddress,
    type: "main",
    entity: "Wallet",
    amount: 0,
  });

  // Process inflow nodes
  inflows.forEach((inflow) => {
    const address = inflow.beneficiary_address;
    const amount = inflow.amount;
    const entity = inflow.entity_name;

    if (!nodesMap.has(address)) {
      nodesMap.set(address, {
        id: address,
        type: "inflow",
        entity,
        amount,
      });
    } else {
      // Update existing node
      const node = nodesMap.get(address);
      node.amount += amount;
      if (node.type !== "main") {
        node.type = "inflow";
      }
    }
  });

  // Process outflow nodes
  outflows.forEach((outflow) => {
    const address = outflow.payer_address;
    const amount = outflow.amount;
    const entity = outflow.entity_name;

    if (!nodesMap.has(address)) {
      nodesMap.set(address, {
        id: address,
        type: "outflow",
        entity,
        amount,
      });
    } else {
      // Update existing node
      const node = nodesMap.get(address);
      node.amount += amount;
      if (node.type !== "main") {
        node.type = "outflow";
      }
    }
  });

  // Create edges
  const edges = [];

  // Inflow edges (from inflow node to main node)
  inflows.forEach((inflow) => {
    edges.push({
      source: inflow.beneficiary_address,
      target: searchAddress,
      amount: inflow.amount,
      type: "inflow",
    });
  });

  // Outflow edges (from main node to outflow node)
  outflows.forEach((outflow) => {
    edges.push({
      source: searchAddress,
      target: outflow.payer_address,
      amount: outflow.amount,
      type: "outflow",
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
    inflows,
    outflows,
  };
};

const initialState = {
  searchAddress: INITIAL_SEARCH_ADDRESS,
  ...processData(INITIAL_SEARCH_ADDRESS),
  activeTab: "inflows",
  highlightedNode: null,
  nodePositions: {},
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {
    addWalletAddress: (state, action) => {
      const newAddress = action.payload;

      // Check if address already exists
      if (state.nodes.some((node) => node.id === newAddress)) {
        return;
      }

      // Add new node
      state.nodes.push({
        id: newAddress,
        type: "inflow", // Default type, will be updated based on connections
        entity: "Unknown",
        amount: 0,
      });

      // Check for potential connections with existing nodes
      // This is a simplified example - in a real app, you would fetch data for this address

      // For demonstration, we'll create a connection to a random existing node
      // In a real app, this would be based on actual transaction data
      const existingNodes = state.nodes.filter(
        (node) => node.id !== newAddress && node.id !== state.searchAddress
      );

      if (existingNodes.length > 0) {
        const randomNode =
          existingNodes[Math.floor(Math.random() * existingNodes.length)];

        // Create edge from new node to random node
        state.edges.push({
          source: newAddress,
          target: randomNode.id,
          amount: 0.1,
          type: "inflow",
        });
      } else {
        // If no other nodes exist, connect to main node
        state.edges.push({
          source: newAddress,
          target: state.searchAddress,
          amount: 0.1,
          type: "inflow",
        });
      }
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    highlightNode: (state, action) => {
      state.highlightedNode = action.payload;
    },
    resetHighlight: (state) => {
      state.highlightedNode = null;
    },
    setNodePositions: (state, action) => {
      state.nodePositions = action.payload;
    },
  },
});

export const {
  addWalletAddress,
  setActiveTab,
  highlightNode,
  resetHighlight,
  setNodePositions,
} = graphSlice.actions;

export default graphSlice.reducer;
