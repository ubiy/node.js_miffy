require('dotenv').config();
const { writeToGoogleSheet, fetchAndSaveHistoricalMessages } = require('./index.js');


// 以下はテスト用のイベントオブジェクトです。実際のSlackイベントに合わせて適切な値に書き換えてください。

const testEvent1 = {
    event: {
      type: "app_mention",
      text: "accountId：KjnbmOfkqfUlCq8uHfERU2lfHtL2photoAT：2023-05-07 14:00prefecture：東京都city：文京区count：3",
      user: "U04N4Q1QX9A",
      ts: "1682683304.654869",
      channel: "C04L60X6084",
      thread_ts: "1682683304.654869"
    }
  };
  
  const testEvent2 = {
    event: {
      type: "app_mention",
      text: "accountId：5BDabtNZKqMqmxAT63O4OqqkORr2photoAT：2023-05-01 18:30prefecture：東京都city：渋谷区count：1",
      user: "U04N4Q1QX9A",
      ts: "1682322626.566979",
      channel: "C04L60X6084",
      thread_ts: "1682322626.566979"
    }
  };
  
  const testEvent3 = {
    event: {
      type: "app_mention",
      text: "accountId：j2cn05P6ygQKWYUVZCAPcy2xUxG3photoAT：2023-04-22 15:00prefecture：大阪府city：岸和田市count：0",
      user: "U04N4Q1QX9A",
      ts: "1681869553.644219",
      channel: "C04L60X6084",
      thread_ts: "1681869553.644219"
    }
  };
  
  const runTest = async () => {
    console.log('Running Test 1');
    const test1Result = await writeToGoogleSheet(testEvent1.event);
    console.log(test1Result);
  
    console.log('Running Test 2');
    const test2Result = await writeToGoogleSheet(testEvent2.event);
    console.log(test2Result);
  
    console.log('Running Test 3');
    const test3Result = await writeToGoogleSheet(testEvent3.event);
    console.log(test3Result);
  };

  runTest();