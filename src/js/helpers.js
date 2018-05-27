const INSIGHT_LOGIN_URL = 'https://insighttimer.com/user_session';
const INSIGHT_CSV_URL = 'https://insighttimer.com/sessions/export';
const HABITICA_PREFS_URL = 'https://habitica.com/api/v3/user?userFields=preferences.dayStart';

const SAVE_KEYS = {
  hUser: 'habiticaUserId',
  hToken: 'habiticaApiToken',
  iEmail: 'insightEmail',
  iPass: 'insightPassword',
  dailyId: 'meditationDailyId',
  goalNum: 'meditationGoal',
  syncDate: 'lastSyncDate',
  mData: 'minutesMeditatedToday',
  lastGoal: 'lastDayGoalWasReached'
};

saveData = async (obj) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(obj, resolve);
  });
}

readData = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, resolve);
  });
}

clearData = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(resolve);
  });
}

getAllStoredData = async () => {
  return readData(Object.values(SAVE_KEYS));
}

postInsightLogin = async (email, password) => {
	return $.ajax({
    url: INSIGHT_LOGIN_URL,
    type: 'POST',
    data: {
      'user_session[email]': email,
      'user_session[password]': password,
    }
  });
}

getHabiticaCustomStart = async (userId, apiToken) => {
	return $.ajax({
    url: HABITICA_PREFS_URL,
    beforeSend: (xhr) => {
      xhr.setRequestHeader('x-api-user', userId);
      xhr.setRequestHeader('x-api-key',  apiToken);
    }
  });
}
