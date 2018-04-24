const HABITICA_EMAIL = 'asher@dales.org';
const HABITICA_PASSWORD = 'y5^%1vl5&U@ns';

const INSIGHT_EMAIL = 'asor1999@gmail.com';
const INSIGHT_PASSWORD = 'asherd';

checkMeditationData = async (alarm) => {
  await $.ajax({
    url: 'https://insighttimer.com/user_session',
    type: 'POST',
    data: {
      'user_session[email]': INSIGHT_EMAIL,
      'user_session[password]': INSIGHT_PASSWORD,
    }
  });
  const meditationData = await getMeditationData();
  for (let i = 0; i < 30; i++) {
    const res = await getMeditationData();
    console.log(res[2][0]);
  }
  return;
  const customDayStart = await getHabiticaCustomDayStart();
  const minsMeditatedToday = await getMinsMeditatedToday(meditationData, customDayStart);
  console.log('Minutes meditated today: ', minsMeditatedToday);
}

getMeditationData = async () => {
  const firstRes = await $.ajax('https://insighttimer.com/sessions/export');
  await new Promise(resolve => setTimeout(resolve, 3000));
  const secondRes = await $.ajax('https://insighttimer.com/sessions/export');
  // const thirdRes = await $.ajax('https://insighttimer.com/sessions/export');
  return firstRes[2][0] === secondRes[2][0] ? // && firstRes[2][0] === thirdRes[2][0] ?
         $.csv.toArrays(firstRes) :
         await getMeditationData();
}

getMinsMeditatedToday = (meditationData, customDayStart) => {
  let meditationMinsToday = 0;
  let i = 2;
  const habiticaDayStart = moment().startOf('day').add(customDayStart, 'h');
  while (meditationData[i]) {
    const offsetSessionDate = moment(meditationData[i][0], 'MM-DD-YYYY HH:mm:ss');
    const correctSessionDate = offsetSessionDate.clone().add(offsetSessionDate.utcOffset(), 'm');
    const sessionMins = parseInt(meditationData[i][1]);
    i += 1;

    console.log(correctSessionDate.format());
    console.log(correctSessionDate.diff(habiticaDayStart, 'h'));
    if (!correctSessionDate.isSame(moment(), 'day')) {
      break;
    }

    meditationMinsToday += sessionMins;
  }
  return meditationMinsToday;
}

getHabiticaCustomDayStart = async () => {
  const user = await $.ajax({
    url: 'https://habitica.com/api/v3/user/auth/local/login',
    type: 'POST',
    data: {
      'username': HABITICA_EMAIL,
      'password': HABITICA_PASSWORD
    }
  });
  const userData = await $.ajax({
    url: 'https://habitica.com/api/v3/user?userFields=preferences',
    beforeSend: (xhr) => {
      xhr.setRequestHeader('x-api-user', user.data.id);
      xhr.setRequestHeader('x-api-key',  user.data.apiToken);
    }
  });
  return userData.data.preferences.dayStart;
}

chrome.alarms.clearAll(() => {
  chrome.alarms.create('meditationCheck', {
    delayInMinutes: 0,
    // periodInMinutes: 0.1
  });
});

chrome.alarms.onAlarm.addListener(checkMeditationData);