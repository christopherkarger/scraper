import * as puppeteer from "puppeteer";
//const puppeteer = require("puppeteer");
import * as isPi from "detect-rpi";
//const isPi = require("detect-rpi");

declare module "puppeteer" {
  export interface Page {
    waitForTimeout(duration: number): Promise<void>;
  }
}

let isRunning = false;
const debuggingMode = true;
const url = process.env.Url;

const userNameInput = "input[name=email]";
const passwordInput = "input[name=password]";
const loginButton = "button[type=submit]";

export const interactWithPage = async (req, res) => {
  if (isRunning) {
    return;
  }

  const username = req.body.username;
  const password = req.body.password;
  isRunning = true;

  const browser = await puppeteer.launch({
    executablePath: isPi() ? "/usr/bin/chromium-browser" : undefined,
    headless: !debuggingMode,
  });

  const page = await browser.newPage();

  const tryToSelect = async (s: string) => {
    try {
      const selected = await page.waitForSelector(s);
      return selected;
    } catch (err) {
      res.status(500).send(`could not select ${s}`);
      throw new Error(`could not select ${s}`);
    }
  };

  const selectAndClick = async (s: string) => {
    await tryToSelect(s);
    await page.click(s);
  };

  // Login process
  await page.goto(url, { waitUntil: "networkidle0" });

  await tryToSelect(userNameInput);
  await page.type(userNameInput, username);

  await tryToSelect(passwordInput);
  await page.type(passwordInput, password);

  await selectAndClick(loginButton);

  try {
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  } catch (err) {
    res.status(500).send(`could not login`);
    throw new Error("could not login");
  }
  // ----------------------------------------

  // Interact with page
  const m = ".collections-sidebar__items li:nth-child(2) button";
  await selectAndClick(m);

  const l = ".collection-detail__add-snip";
  await selectAndClick(l);

  await page.waitForTimeout(2000);

  // Make Screenshot
  await page.screenshot({ path: "example.png" });

  // ----------------------------------------

  // Close Browser
  await browser.close();
  isRunning = false;

  res.send({});
};
