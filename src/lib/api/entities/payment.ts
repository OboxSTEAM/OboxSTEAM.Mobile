import { z } from "zod";

export const paymentGatewaySchema = z.enum(["Stripe", "MoMo"]);

export type PaymentGateway = z.infer<typeof paymentGatewaySchema>;
