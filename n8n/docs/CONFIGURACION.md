# Guía de Configuración e Importación de Workflows en n8n

Esta guía detalla los pasos para importar, parametrizar y habilitar los dos workflows de supervisión de **CONSTRUCTA** en una instancia local o remota de n8n.

---

## 1. Requisitos Previos

1. **Instancia de n8n:** Versión `1.x` o `2.x` (probado y validado en n8n `2.38.6`).
2. **Servidor API de CONSTRUCTA:** Activo y accesible en la red (ejemplo local: `http://localhost:5173`).
3. **Cuenta de Gmail:** Cuenta de correo dedicada para la automatización (preferentemente una cuenta de servicio o práctica, evitando cuentas personales).

---

## 2. Variables de Entorno Recomendadas

Dentro de la configuración de n8n (archivo `.env` de n8n o variables del contenedor Docker/sistema operativo), declare las siguientes variables:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `CONSTRUCTA_API_BASE_URL` | URL base de la API REST de CONSTRUCTA | `http://localhost:5173/api` |
| `CONSTRUCTA_ALERT_EMAIL` | Buzón destinatario de las alertas operativas | `admin@constructa.com` |
| `CONSTRUCTA_REPORT_EMAIL` | Buzón destinatario del reporte ejecutivo diario | `gerencia@constructa.com` |
| `CONSTRUCTA_TIMEZONE` | Zona horaria para la programación del disparador diario | `America/Costa_Rica` |
| `CONSTRUCTA_API_TOKEN` | Token Bearer si en producción se restringe la API | *(Opcional / no requerido en local)* |

---

## 3. Configuración de Credenciales de Gmail (OAuth2)

Para que los nodos de envío puedan despachar correos sin almacenar contraseñas en texto plano:

1. Inicie sesión en la interfaz web de n8n (`http://localhost:5678`).
2. Vaya a **Credentials** > **Add Credential**.
3. Seleccione **Gmail OAuth2 API**.
4. Configure los parámetros:
   - **Credential Name:** `Gmail CONSTRUCTA` (o vincular con el ID `constructa_gmail_cred`).
   - Ingrese el **Client ID** y **Client Secret** obtenidos de Google Cloud Console (con los scopes `https://www.googleapis.com/auth/gmail.send`).
5. Haga clic en **Sign in with Google** y autorice el acceso.
6. Guarde la credencial.

---

## 4. Importación de los Workflows

Los archivos JSON se encuentran listos para importarse en la carpeta `/n8n/workflows/`:

### Opción A: Desde la Interfaz Web de n8n
1. En el panel izquierdo de n8n, diríjase a **Workflows**.
2. Haga clic en el botón de opciones `...` (arriba a la derecha) y seleccione **Import from File**.
3. Seleccione el archivo:
   - `CONSTRUCTA_Alerta_Operativa.json` para el flujo de alertas.
   - `CONSTRUCTA_Reporte_Ejecutivo_Diario.json` para el reporte diario.
4. Una vez cargado el lienzo, verifique que el nodo de **Gmail** tenga asignada la credencial configurada en el paso 3.
5. Guarde el flujo y active el interruptor **Active** (o ejecute una prueba manual haciendo clic en **Test Step**).

### Opción B: Desde la Línea de Comandos (CLI de n8n)
Si tiene acceso al shell del servidor n8n:
```bash
n8n import:workflow --input=n8n/workflows/CONSTRUCTA_Alerta_Operativa.json
n8n import:workflow --input=n8n/workflows/CONSTRUCTA_Reporte_Ejecutivo_Diario.json
```

---

## 5. Endpoints Reales Utilizados de la API de CONSTRUCTA

Los workflows consultan los datos operativos mediante las siguientes rutas certificadas:

| Endpoint | Método | Utilización en el Workflow |
| :--- | :---: | :--- |
| `/api/db` | `GET` | Consulta agregada de alta velocidad: devuelve el estado consolidado de `projects`, `expenses`, `materials`, `purchaseOrders`, `requests`, `materialRequests` y `users`. |
| `/api/projects` | `GET` | Colección individual de obras, presupuestos autorizados, avances físicos y fechas contractuales. |
| `/api/expenses` | `GET` | Registro de egresos y facturas imputadas a cada obra para cómputo de sobrecostos. |
| `/api/materials` | `GET` | Inventario central, niveles de stock actual y umbrales de stock mínimo. |
| `/api/purchaseOrders` | `GET` | Órdenes de compra vigentes, proveedores, estatus de entrega y fechas prometidas. |
| `/api/requests` | `GET` | Solicitudes y cotizaciones ingresadas por clientes. |
| `/api/materialRequests` | `GET` | Requerimientos urgentes de insumos emitidos por residentes de obra. |
| `/api/ai/analyze` | `POST` | Proxy corporativo seguro de IA para la redacción del resumen ejecutivo diario sin alucinaciones. |

---

## 6. Personalización de Umbrales y Reglas de Negocio

Dentro del nodo `Analizar Alertas y Deduplicar` del Workflow 1, puede ajustar los umbrales modificando el bloque centralizado `CONFIG`:

```javascript
const CONFIG = {
  budgetThresholds: {
    medium: 5,   // Sobrecosto >= 5% -> Alerta Media
    high: 10,    // Sobrecosto >= 10% -> Alerta Alta
    critical: 20 // Sobrecosto >= 20% -> Alerta Crítica
  },
  reminderHours: 24,       // Intervalo de reenvío para alertas no resueltas (evita spam)
  stockCriticalRatio: 0.5, // Stock por debajo del 50% del mínimo activa alerta
  defaultRecipient: $env.CONSTRUCTA_ALERT_EMAIL || 'admin@constructa.com'
};
```
