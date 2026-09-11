// src/utils/localStorageHelper.js

export const saveOrdersToLocal = (orders) => {
  try {
    localStorage.setItem("cachedOrders", JSON.stringify(orders));
  } catch (error) {
    console.error("❌ Failed to save orders to localStorage:", error);
  }
};

export const loadOrdersFromLocal = () => {
  try {
    const data = localStorage.getItem("cachedOrders");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Failed to load orders from localStorage:", error);
    return null;
  }
};