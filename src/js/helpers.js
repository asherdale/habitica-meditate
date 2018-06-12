saveData = async (obj) => {
  const objWithCorrectKeys = {};
  Object.keys(obj).forEach((key) => {
    objWithCorrectKeys[KEY_ABSTRACTIONS[key]] = obj[key];
  });

  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(objWithCorrectKeys, resolve);
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
  const storedData = await readData(Object.values(KEY_ABSTRACTIONS));
  const objWithCorrectKeys = {};
  Object.keys(KEY_ABSTRACTIONS).forEach((key) => {
    objWithCorrectKeys[key] = storedData[KEY_ABSTRACTIONS[key]];
  });
  return objWithCorrectKeys;
}

postInsightLogin = async (email, password) => {
	return $.ajax({
    url: config.INSIGHT_LOGIN_URL,
    type: 'POST',
    data: {
      'user_session[email]': email,
      'user_session[password]': password,
    }
  });
}

getHabiticaCustomStart = async (userId, apiToken) => {
	return $.ajax({
    url: config.HABITICA_PREFS_URL,
    beforeSend: (xhr) => {
      xhr.setRequestHeader('x-api-user', userId);
      xhr.setRequestHeader('x-api-key',  apiToken);
    }
  });
}

isToday = date => moment(date, config.DATE_FORMAT).isSame(moment(), 'day');
