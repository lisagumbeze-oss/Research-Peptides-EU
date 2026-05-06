export type OrderLineItem = {
  title: string;
  quantity: number;
  price: number;
  specification?: string;
};

export type OrderEmailPayload = {
  orderId: string;
  status: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  shippingCost: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderLineItem[];
};

export type ContactEmailPayload = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export type EmailRenderResult = {
  subject: string;
  html: string;
  text: string;
};
