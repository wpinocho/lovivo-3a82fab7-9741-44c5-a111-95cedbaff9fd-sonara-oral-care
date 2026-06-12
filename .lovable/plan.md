Diagnóstico:
- El RPC `get_public_paypal_account` sí responde 200 y devuelve cuenta activa para esta tienda con `environment: "live"` y `client_id`.
- El botón no aparece porque el componente usa la API legacy (`PayPalScriptProvider` / `PayPalButtons`) con la versión instalada `@paypal/react-paypal-js@10`, cuya API principal es SDK v6. Además se está pasando `data-environment: "live"`, pero v6 espera `environment: "production"`.

Plan de implementación:
1. Actualizar `src/components/PaypalExpressButton.tsx` para usar la API v6:
   - Importar desde `@paypal/react-paypal-js/sdk-v6`.
   - Usar `PayPalProvider` y `PayPalOneTimePaymentButton`.
   - Mapear `paypalEnvironment === 'live'` a `environment="production"`, y `sandbox` a `sandbox`.
2. Mantener la misma lógica existente:
   - No renderizar si no hay `paypalEnabled`, `paypalClientId` o `checkoutToken`.
   - `createOrder` sigue invocando `paypal-create-order`.
   - `onApprove` sigue invocando `paypal-capture-order`, limpia carrito y navega a `/gracias/:id`.
3. Verificar en `/pagar`:
   - Confirmar que el SDK de PayPal carga en network.
   - Confirmar visualmente que aparece el botón de PayPal debajo de Google Pay/Link.
   - Confirmar que no hay errores de consola relacionados con PayPal.