checkMeditationData = async () => {
  const storedData = await getAllStoredData();
  // if (isToday(storedData.lastGoal)) {
  //   return;
  // }
  const meditationData = await getMeditationData(
    storedData.iEmail,
    storedData.iPass
  );
  const habiticaDayStart = await getHabiticaDayStart(
    storedData.hUser,
    storedData.hToken
  );
  const minsToday = await getMinsMeditatedToday(
    meditationData,
    habiticaDayStart
  );
  const goalReached = minsToday >= storedData.goalNum;
  const now = moment().format(config.DATE_FORMAT);
  const dataToSave = {
    mData: minsToday,
    syncDate: now
  };
  if (goalReached) {
    dataToSave.lastGoal = now;
    await scoreTask(storedData.hUser, storedData.hToken, storedData.dailyId);
  }
  await saveData(dataToSave);
}

getMeditationData = async (iEmail, iPass) => {
  await postInsightLogin(iEmail, iPass);
  const numGrabs = 7;
  const vals = await Promise.all(
    Array.from(
      {length: config.NUM_REQS_TO_INSIGHT},
      i => $.ajax(config.INSIGHT_CSV_URL)
    )
  );
  const csvs = vals.map(val => $.csv.toArrays(val));
  const times = {};
  csvs.forEach((csv) => {
    csv.splice(0, 2);
    const time = csv[0][0];
    times[time] = times[time] ? times[time] + 1 : 1;
  });
  const accurateTime = Object.keys(times).find(t => {
    return times[t] > config.NUM_REQS_TO_INSIGHT / 2;
  });
  return accurateTime ? 
         csvs.find(csv => csv[0][0] === accurateTime) :
         getMeditationData();
}

getMinsMeditatedToday = (meditationData, habiticaDayStart) => {
  let meditationMinsToday = 0;
  let i = 0;

  while (meditationData[i]) {
    const offsetTime = moment(meditationData[i][0], config.DATE_FORMAT);
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