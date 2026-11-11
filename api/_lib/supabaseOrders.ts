/**
 * Compatibility shim — orders live on Neon.
 * Email/payment handlers import this path; implementation is Neon-backed.
 */
export {
  fetchOrderById,
  patchOrderShippingAddress,
  patchOrderStatus,
  patchOrderFields,
} from './neonOrders.js';
