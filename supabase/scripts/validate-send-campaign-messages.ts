/**
 * Script de validación local para Phase 2: Campaign Message Sending Service
 *
 * Uso: tsx -r dotenv/config supabase/scripts/validate-send-campaign-messages.ts
 *
 * Prueba el servicio sendCampaignMessages() con datos reales de Supabase
 * y variables de .env para WhatsApp/Twilio
 */

import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppMessage } from "@/features/whatsapp/service/send-whatsapp-message";
import { normalizeWhatsAppPhone } from "@/features/whatsapp/utils/normalize-whatsapp-phone";
import { sendCampaignMessages } from "@/lib/campaigns/send-campaign-messages";
import type { CampaignRecord } from "@/lib/campaigns/types";

// ============================================================
// Color output helpers
// ============================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, "green");
}

function warning(message: string) {
  log(`⚠ ${message}`, "yellow");
}

function error(message: string) {
  log(`✗ ${message}`, "red");
}

function info(message: string) {
  log(`ℹ ${message}`, "cyan");
}

function section(title: string) {
  console.log();
  log(`\n${"=".repeat(60)}`, "blue");
  log(`  ${title}`, "bright");
  log(`${"=".repeat(60)}\n`, "blue");
}

// ============================================================
// Validation Steps
// ============================================================

async function validateEnvironmentVariables(): Promise<boolean> {
  section("1️⃣  Validando Variables de Entorno");

  const requiredVars = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    WHATSAPP_ENABLED: process.env.WHATSAPP_ENABLED,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  };

  let allValid = true;

  for (const [varName, value] of Object.entries(requiredVars)) {
    if (value) {
      const displayValue =
        varName.includes("TOKEN") || varName.includes("KEY")
          ? value.substring(0, 10) + "..."
          : value;
      success(`${varName} = ${displayValue}`);
    } else {
      error(`${varName} no está configurada`);
      allValid = false;
    }
  }

  return allValid;
}

async function validateSupabaseConnection(): Promise<boolean> {
  section("2️⃣  Validando Conexión a Supabase");

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      error("Falta configuración de Supabase");
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error: err } = await supabase
      .from("campaigns")
      .select("*")
      .limit(1);

    if (err) {
      error(`Error conectando a Supabase: ${err.message}`);
      return false;
    }

    success("Conexión a Supabase establecida");
    info(`Campañas encontradas en la base de datos: ${data?.length || 0}`);
    return true;
  } catch (err) {
    error(
      `Error inesperado: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

async function validatePhoneNormalization(): Promise<boolean> {
  section("3️⃣  Validando Normalización de Teléfonos");

  const testNumbers = [
    { input: "+1 (555) 123-4567", expected: "+15551234567" },
    { input: "555-123-4567", expected: "+1555123457", countryCode: "1" },
    { input: "(555) 123-4569", expected: "5551234569" },
    { input: "+34 912 34 56 78", expected: "+34912345678" },
  ];

  let allValid = true;

  for (const test of testNumbers) {
    const result = normalizeWhatsAppPhone(test.input, {
      defaultCountryCode: test.countryCode,
    });

    if (
      result === test.expected ||
      result.replace(/\+/g, "") === test.expected.replace(/\+/g, "")
    ) {
      success(`"${test.input}" → "${result}"`);
    } else {
      warning(`"${test.input}" → "${result}" (esperado: "${test.expected}")`);
    }
  }

  return allValid;
}

async function validateServiceIntegration(): Promise<boolean> {
  section("4️⃣  Validando Integración del Servicio");

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      warning("Saltando prueba del servicio: falta configuración de Supabase");
      return true;
    }

    // Crear campaña mock para pruebas
    const mockCampaign: CampaignRecord = {
      id: "test-campaign-" + Date.now(),
      business_id: "test-business",
      name: "Test Validation Campaign",
      campaign_type: "reactivation",
      audience_type: "inactive_customers",
      message: "¡Hola! Vuelve y disfruta de un 20% de descuento 🎉",
      target_inactive_days: 30,
      status: "sent",
      scheduled_at: null,
      sent_at: null,
      total_messages: 0,
      messages_sent: 0,
      messages_failed: 0,
      created_at: new Date().toISOString(),
    };

    // Clientes de prueba (NO ENVÍES A NÚMEROS REALES)
    const mockCustomers = [
      { customerId: "test-customer-1", phone: "+1 (555) 123-4567" },
      { customerId: "test-customer-2", phone: "5551234568" },
    ];

    info("Enviando mensajes de prueba...");
    info(
      "📍 NOTA: Usando números de prueba, los mensajes no se enviarán realmente",
    );

    const result = await sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers,
      countryCode: "1",
    });

    success(`Servicio completó sin errores`);
    info(`- Total enviados: ${result.totalSent}`);
    info(`- Total fallidos: ${result.totalFailed}`);
    info(`- Mensajes procesados: ${result.messageGroups.length}`);

    // Mostrar detalles de cada mensaje
    result.messageGroups.forEach((group, index) => {
      const statusSymbol = group.status === "sent" ? "✓" : "✗";
      const details = group.errorMessage ? ` (${group.errorMessage})` : "";
      info(`  ${statusSymbol} Cliente ${index + 1}: ${group.status}${details}`);
    });

    return true;
  } catch (err) {
    error(
      `Error en servicio: ${err instanceof Error ? err.message : String(err)}`,
    );
    console.error(err);
    return false;
  }
}

async function validateDatabaseSchema(): Promise<boolean> {
  section("5️⃣  Validando Esquema de Base de Datos");

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      warning(
        "Saltando validación de esquema: falta configuración de Supabase",
      );
      return true;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verificar tabla campaign_messages
    const { data: messages, error: messagesError } = await supabase
      .from("campaign_messages")
      .select("*")
      .limit(1);

    if (messagesError) {
      error(`Tabla campaign_messages: ${messagesError.message}`);
      return false;
    }
    success("Tabla campaign_messages encontrada ✓");

    // Verificar tabla campaign_stats
    const { data: stats, error: statsError } = await supabase
      .from("campaign_stats")
      .select("*")
      .limit(1);

    if (statsError) {
      error(`Tabla campaign_stats: ${statsError.message}`);
      return false;
    }
    success("Tabla campaign_stats encontrada ✓");

    // Verificar que campaigns tiene las columnas nuevas
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select(
        "total_messages, messages_sent, messages_failed, scheduled_at, sent_at",
      )
      .limit(1);

    if (campaignsError) {
      error(`Columnas en campaigns: ${campaignsError.message}`);
      return false;
    }
    success("Columnas en campaigns encontradas ✓");

    return true;
  } catch (err) {
    error(
      `Error inesperado: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

// ============================================================
// Main Validation Flow
// ============================================================

async function main() {
  log("\n", "bright");
  log("╔════════════════════════════════════════════════════════╗", "cyan");
  log("║   ValidationOS - Phase 2: Message Sending Service     ║", "cyan");
  log("╚════════════════════════════════════════════════════════╝", "cyan");

  const validations = [
    { name: "Variables de Entorno", fn: validateEnvironmentVariables },
    { name: "Conexión a Supabase", fn: validateSupabaseConnection },
    { name: "Normalización de Teléfonos", fn: validatePhoneNormalization },
    { name: "Integración del Servicio", fn: validateServiceIntegration },
    { name: "Esquema de Base de Datos", fn: validateDatabaseSchema },
  ];

  const results: Array<{ name: string; passed: boolean }> = [];

  for (const validation of validations) {
    try {
      const passed = await validation.fn();
      results.push({ name: validation.name, passed });
    } catch (err) {
      error(`Error en validación: ${validation.name}`);
      console.error(err);
      results.push({ name: validation.name, passed: false });
    }
  }

  // ============================================================
  // Summary
  // ============================================================
  section("📊 Resumen de Validación");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const symbol = result.passed ? "✓" : "✗";
    const color = result.passed ? "green" : "red";
    log(`  ${symbol} ${result.name}`, color);
  });

  console.log();
  if (passed === total) {
    success(`Todas las validaciones pasaron (${passed}/${total})`);
    info(
      "La Phase 2 está lista para producción. Puedes empezar a enviar campañas.",
    );
  } else {
    warning(
      `${total - passed} validación(es) fallaron. Por favor verifica los errores arriba.`,
    );
  }

  // ============================================================
  // Next Steps
  // ============================================================
  section("📝 Próximos Pasos");

  log("1. Revisa los errores anteriores si los hubiera", "dim");
  log(
    "2. Asegúrate de tener un archivo .env con las variables correctas",
    "dim",
  );
  log("3. Para enviar una campaña real, usa:", "dim");
  log("   ", "dim");
  log(
    '   import { sendCampaignMessages } from "@/lib/campaigns/send-campaign-messages";',
    "cyan",
  );
  log("   ", "dim");
  log("   const result = await sendCampaignMessages({", "cyan");
  log("     campaign: yourCampaign,", "cyan");
  log("     customerPhoneNumbers: [...],", "cyan");
  log("   });", "cyan");
  log("   ", "dim");
  log("4. Consulta tests en tests/unit/send-campaign-messages.test.ts", "dim");
  log("5. Para ejecutar tests:", "dim");
  log("   npm run test -- send-campaign-messages.test.ts", "cyan");

  console.log();
  process.exit(passed === total ? 0 : 1);
}

main();
