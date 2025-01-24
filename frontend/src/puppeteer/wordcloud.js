import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { inputList } from './mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cur = new Date();
const [month, date, hours, minutes] = [cur.getMonth() + 1, cur.getDate(), cur.getHours(), cur.getMinutes()].map(
  (val) => (val < 10 ? `0${val}` : `${val}`)
);

const RECORD_ENV = 'LOCAL';
const PAGE_NUM = 15;
const URL = RECORD_ENV === 'LOCAL' ? `http://localhost:5173/` : `https://road-to-friendly.kro.kr/`;

const RECORD_DURATION = 15000;
const INPUT_DELAY = 500;
const INPUT_START_DELAY = 500;

const MAX_KEYWORDS_NUM = 50;
const KEYWORDS_PROCESS_INTERVAL = 300;

const OPTION = {
  headless: false,
  args: ['--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling']
};

const TRACING_OPTION = {
  path: path.join(
    __dirname,
    'result',
    `profile_${month}${date}_${hours}${minutes}_duration${RECORD_DURATION / 1000}_processInterval${KEYWORDS_PROCESS_INTERVAL}_maxKeywords${MAX_KEYWORDS_NUM}_pageCount${PAGE_NUM}.json`
  ),
  screenshots: false
};

const mockInputData = (() => {
  function get(idx) {
    const safeIdx = idx % inputList.length;
    return inputList[safeIdx];
  }

  return { get };
})();

const state = { timeover: false };

function delay(duration) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, duration)
  );
}

async function openPageList(browser) {
  const pageList = await Promise.all(Array.from({ length: PAGE_NUM }, async () => browser.newPage()));

  return pageList;
}

function checkPageList(pageList) {
  if (!Array.isArray(pageList) || pageList.length < 2)
    throw new Error('페이지 배열이 올바르지 않거나 페이지 개수가 2개 미만입니다.');
}

async function openRoom(hostPage) {
  await hostPage.bringToFront();
  await hostPage.goto(URL);

  const openButton = hostPage.locator('button ::-p-text(공감 포인트 나누기 시작하기)');
  await openButton.click();

  // '방이 텅 비었어요.' 텍스트가 나타날 때(room 컴포넌트가 나타났을 때)까지 기다리기
  await hostPage.waitForFunction(() => {
    return document.body.innerText.includes('방이 텅 비었어요.');
  });

  const roomURL = await hostPage.url();
  return roomURL;
}

async function enterRoom(pageList, roomURL) {
  checkPageList(pageList);

  for (let i = 0; i < pageList.length; i++) {
    if (i === 0) continue;

    const page = pageList[i];
    await page.bringToFront();
    await page.goto(roomURL);
    await page.waitForFunction(() => {
      return document.body.innerText.includes('방장이 시작 버튼을 누르지 않았어요.');
    });
  }
}

async function startGame(hostPage) {
  await hostPage.bringToFront();
  const startButton = await hostPage.locator('button ::-p-text(관심사로 소통 시작하기 🚀)');
  return startButton.click();
}

function startTracing(pageList) {
  const hostPage = pageList[0];
  const inputSelector = 'input[placeholder="답변을 입력해주세요"]';

  let intervalCntList = [];

  function startInput() {
    const intervalPromiseList = pageList.map(async (page, idx) => {
      await delay(INPUT_START_DELAY * idx);
      intervalCntList.push(0);
      return setInterval(async () => {
        if (state.timeover) return;

        await page.type(inputSelector, mockInputData.get(idx + intervalCntList[idx]++));
        await page.focus(inputSelector);
        page.keyboard.press('Enter');
      }, INPUT_DELAY);
    });
    return intervalPromiseList;
  }

  const intervalPromiseList = startInput();
  hostPage.tracing.start(TRACING_OPTION);
  const tracingPromise = new Promise(async (resolve) => {
    await delay(RECORD_DURATION);
    state.timeover = true;
    for (let i = 0; i < intervalPromiseList.length; i++) {
      await intervalPromiseList[i].then((id) => clearInterval(id));
    }
    for (let i = 1; i < pageList.length; i++) pageList[i].close();
    pageList[0].goBack();
    await hostPage.tracing.stop();
    resolve();
  });

  return tracingPromise;
}

const browser = await puppeteer.launch(OPTION);
const pageList = await openPageList(browser);
const hostPage = pageList[0];

const roomURL = await openRoom(hostPage);
await enterRoom(pageList, roomURL);

await startGame(hostPage);
await startTracing(pageList);
await browser.disconnect();
process.exit(0);
