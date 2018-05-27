checkMeditationData = async (alarm) => {
  const storedData = await getAllStoredData();
  const meditationData = await getMeditationData(
    storedData[SAVE_KEYS.iEmail],
    storedData[SAVE_KEYS.iPass]
  );
  const habiticaDayStart = await getHabiticaDayStart(
    storedData[SAVE_KEYS.hUser],
    storedData[SAVE_KEYS.hToken]
  );
  const minsToday = await getMinsMeditatedToday(
    meditationData,
    habiticaDayStart
  );
  const goalReached = minsToday >= storedData[SAVE_KEYS.goalNum];
  const now = moment().format('MM-DD-YYYY H:m:s');
  const dataToSave = {
    [SAVE_KEYS.mData]: minsToday,
    [SAVE_KEYS.syncDate]: now
  };
  if (goalReached) {
    dataToSave[SAVE_KEYS.lastGoal] = now;
  }
  await saveData(dataToSave);
}

getMeditationData = async (iEmail, iPass) => {
  await postInsightLogin(iEmail, iPass);
  const numGrabs = 7;
  const vals = await Promise.all(
    Array.from(
      {length: numGrabs},
      i => $.ajax(INSIGHT_CSV_URL)
    )
  );
  const csvs = vals.map(val => $.csv.toArrays(val));
  const times = {};
  csvs.forEach((csv) => {
    const time = csv[2][0];
    times[time] = times[time] ? times[time] + 1 : 1;
  });
  const accurateTime = Object.keys(times).find(t => times[t] > numGrabs / 2);
  return accurateTime ? 
         csvs.find(csv => csv[2][0] === accurateTime) :
         getMeditationData();
}

getMinsMeditatedToday = (meditationData, habiticaDayStart) => {
  let meditationMinsToday = 0;
  let i = 2;

  while (meditationData[i]) {
    const offsetTime = moment(meditationData[i][0], 'MM-DD-YYYY HH:mm:ss');
    const correctTime = offsetTime.clone().add(offsetTime.utcOffset(), 'm');
    const sessionMins = parseInt(meditationData[i][1]);
    i += 1;

    if (correctTime.isBefore(habiticaDayStart)) {
      break;
    }

    meditationMinsToday += sessionMins;
  }
  return meditationMinsToday;
}

getHabiticaDayStart = async (hUser, hToken) => {
  const userData = await getHabiticaCustomStart(hUser, hToken);

  const customStartHour = userData.data.preferences.dayStart;
  const customStartTime = moment().startOf('day').add(customStartHour, 'h');
  if (moment().hour() < customStartHour) {
    customStartTime.subtract(1, 'days');
  }

  return customStartTime;
}

chrome.alarms.clearAll(() => {
  chrome.alarms.create('meditationCheck', {
    delayInMinutes: 0,
    // periodInMinutes: 0.1
  });
});

chrome.alarms.onAlarm.addListener(checkMeditationData);