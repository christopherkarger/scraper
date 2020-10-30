import * as puppeteer from "puppeteer";
import * as isPi from "detect-rpi";
import { sendEmail } from "./send-email";

declare module "puppeteer" {
  export interface Page {
    waitForTimeout(duration: number): Promise<void>;
  }
}

let isRunning = false;

export const interactWithPage = async (req, res) => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  const debuggingMode = process.env.Debugging;
  const url = process.env.Url;
  const userNameInput = "input[name=email]";
  const passwordInput = "input[name=password]";
  const loginButton = "button[type=submit]";
  const username = req.body.username;
  const password = req.body.password;
  const accounts = process.env.Accounts.split(",");

  if (isRunning || !accounts.includes(username)) {
    res.status(500).send(`interacting rejected - is running: ${isRunning}`);
    return;
  }

  console.log("START INTERACTING");

  isRunning = true;

  //res.send({});

  try {
    browser = await puppeteer.launch({
      executablePath: isPi() ? "/usr/bin/chromium-browser" : undefined,
      headless: debuggingMode === "true",
    });
  } catch (err) {
    isRunning = false;
    res.status(500).send("chromium launching failed");
    throw new Error(`chromium launching failed: debug ${debuggingMode}`);
  }
  try {
    page = await browser.newPage();
  } catch (err) {
    isRunning = false;
    res.status(500).send("chromium opening failed");
    throw new Error("chromium opening failed");
  }

  if (!page || !browser) {
    return;
  }

  const exit = async () => {
    isRunning = false;
    await browser.close();
  };

  const tryToSelect = async (s: string) => {
    try {
      const selected = await page.waitForSelector(s);
      return selected;
    } catch (err) {
      await exit();
      throw new Error(`could not select ${s}`);
    }
  };

  const selectAndClick = async (s: string) => {
    await tryToSelect(s);
    await page.click(s);
  };

  // Login process
  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    await tryToSelect(userNameInput);
    await page.type(userNameInput, username);
    await tryToSelect(passwordInput);
    await page.type(passwordInput, password);
    await selectAndClick(loginButton);
  } catch (err) {
    await exit();
  }

  try {
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  } catch (err) {
    await browser.close();
    await exit();
    throw new Error("could not login");
  }
  // ----------------------------------------

  // Interact with page
  try {
    const m = ".collections-sidebar__items li:nth-child(2) button";
    await selectAndClick(m);

    const l = ".collection-detail__add-snip";
    await selectAndClick(l);

    //await page.waitForTimeout(1000 * 60 * 1);

    // Make Screenshot
    await page.screenshot({ path: "example.png" });
  } catch (err) {
    await exit();
  }

  // ----------------------------------------

  // Exit
  console.log("STOP INTERACTING, EVERYTHING WENT FINE");
  await exit();
  try {
    sendEmail("👍 Hallo, alles erledigt! 👍");
  } catch (err) {
    throw new Error("Email sending Error");
  }
};
