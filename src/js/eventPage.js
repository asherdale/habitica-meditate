checkMeditationData = async (alarm) => {
  return;
  const meditationData = await getMeditationData();
  const habiticaDayStart = await getHabiticaDayStart();
  const minsToday = await getMinsMeditatedToday(meditationData, habiticaDayStart);
  console.log('Minutes meditated today: ', minsToday);
}

getMeditationData = async () => {
  await postInsightLogin(INSIGHT_EMAIL, INSIGHT_PASSWORD);
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

  console.log(habiticaDayStart.format());
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

getHabiticaDayStart = async () => {
  const userData = await getHabiticaCustomStart(HABITICA_USER_ID, HABITICA_API_TOKEN);

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