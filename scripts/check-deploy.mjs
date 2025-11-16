import { chromium } from "playwright";

function ensureEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function hasSupabaseSession(page) {
  return page.evaluate(() => {
    const keys = Object.keys(localStorage || {});
    return keys.some((key) => key.includes("sb-") && key.endsWith("-auth-token"));
  });
}

async function checkLoginState(page) {
  const [session, loginFormVisible] = await Promise.all([
    hasSupabaseSession(page),
    page.$("#login-email"),
  ]);

  return {
    session,
    loginFormVisible: Boolean(loginFormVisible),
  };
}

async function main() {
  const siteUrl = ensureEnv("CHECK_SITE_URL").replace(/\/$/, "");
  const email = ensureEnv("CHECK_EMAIL");
  const password = ensureEnv("CHECK_PASSWORD");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      consoleMessages.push({ type, text: msg.text() });
    }
  });

  try {
    console.log("➡️  Abrindo página de login...");
    await page.goto(`${siteUrl}/login`, { waitUntil: "networkidle" });
    await page.waitForSelector("form", { timeout: 10000 });

    console.log("➡️  Inserindo credenciais...");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2500);
    const afterLogin = await checkLoginState(page);

    if (!afterLogin.session || afterLogin.loginFormVisible) {
      console.error("❌ Login não estabeleceu sessão persistida.");
      console.error({ afterLogin, consoleMessages });
      process.exit(2);
    }
    console.log("✅ Sessão criada após login.");

    console.log("↻ Recarregando página para testar persistência...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const afterReload = await checkLoginState(page);
    if (!afterReload.session || afterReload.loginFormVisible) {
      console.error("❌ Sessão perdida após recarregar a página.");
      console.error({ afterReload, consoleMessages });
      process.exit(3);
    }

    console.log("✅ Sessão persistiu após recarregar.");
    console.log("🎉 Login em produção está consistente.");
  } catch (err) {
    console.error("❌ Erro durante o teste automático de login:", err);
    console.error({ consoleMessages });
    process.exit(4);
  } finally {
    await browser.close();
  }
}

main();
