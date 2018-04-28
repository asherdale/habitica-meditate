const LOGIN_INFO = {
  hUser: 'habiticaUserId',
  hToken: 'habiticaApiToken',
  iEmail: 'insightEmail',
  iPass: 'insightPassword'
};

const INSIGHT_LOGIN_CONFIG = {
  header: 'Step 2: Login to Insight Timer',
  userPlaceholder: 'Email',
  passPlaceholder: 'Password'
};

let isHabiticaLogin = true;

$(document).ready(() => main());

main = async () => {
  $('#login-button').click(login);

  const savedLoginInfo = await readData(Object.values(LOGIN_INFO));
  if (!savedLoginInfo.habiticaUserId || !savedLoginInfo.habiticaApiToken) {
    return;
  }
  const habiticaLoginAttempt = await clientHabiticaLogin(savedLoginInfo.habiticaUserId, savedLoginInfo.habiticaApiToken, true);
  if (habiticaLoginAttempt) {
    isHabiticaLogin = false;
    if (!savedLoginInfo.insightEmail || !savedLoginInfo.insightPassword) {
      return;
    }
    await clientInsightLogin(savedLoginInfo.insightEmail, savedLoginInfo.insightPassword, true);
  }
}

login = () => {
  const loginInput = $('input').map((i, el) => $(el).val()).get();
  return isHabiticaLogin ? clientHabiticaLogin(loginInput[0], loginInput[1], false)
                         : clientInsightLogin(loginInput[0], loginInput[1], false);
}

clientHabiticaLogin = async (userId, apiToken, isAutoLogin) => {
  try {
    const userData = await getHabiticaCustomStart(userId, apiToken);
    if (!isAutoLogin) {
      await saveData({[LOGIN_INFO.hUser]: userId, [LOGIN_INFO.hToken]: apiToken});
    }
    transferToInsightLogin();
    return true;
  } catch (e) {
    dump('Habitica login error');
  }
}

transferToInsightLogin = () => {
  isHabiticaLogin = false;
  $('#login-header').text(INSIGHT_LOGIN_CONFIG.header);
  
  const resetToPlaceholder = ($el, placeholder) => {
    $el.val('');
    $el.attr('placeholder', placeholder);
  }

  resetToPlaceholder($('#input-user'), INSIGHT_LOGIN_CONFIG.userPlaceholder);
  resetToPlaceholder($('#input-pass'), INSIGHT_LOGIN_CONFIG.passPlaceholder);
}

clientInsightLogin = async (email, password, isAutoLogin) => {
  const loginResult = await insightLogin(email, password);
  if (loginResult.toLowerCase().includes('sign')) {
    dump('Insight login error');
    return false;
  }

  if (!isAutoLogin) {
    await saveData({[LOGIN_INFO.iEmail]: email, [LOGIN_INFO.iPass]: password});
  }

  showContainer('create-container');
  return true;
}

showContainer = (containerId) => {
  $('.container').addClass('display-none');
  $(`#${containerId}`).removeClass('display-none');
}

dump = (input) => {
  $('#dump').prepend(`${JSON.stringify(input)}<br />`);
}

saveData = async (obj) => {
  await chromep.storage.sync.set(obj);
}

readData = async (keys) => {
  return chromep.storage.sync.get(keys);
}

clearData = async () => {
  await chromep.storage.sync.clear();
}

createDaily = async (userId, apiToken) => {
  return $.ajax({
    url: 'https://habitica.com/api/v3/tasks/user',
    type: 'POST',
    data: {'text': `Meditate for ${medLength} minutes`, 'type': 'daily',},
    beforeSend: (xhr) => {
      xhr.setRequestHeader('x-api-user', userId);
      xhr.setRequestHeader('x-api-key',  apiToken);
    },
  });
}

scoreDaily = async (userId, apiToken) => {
  return $.ajax({
    url: `https://habitica.com/api/v3/tasks/${items.taskID}/score/up`,
    type: 'POST',
    beforeSend: (xhr) => {
      xhr.setRequestHeader('x-api-user', userId);
      xhr.setRequestHeader('x-api-key',  apiToken);
    },
  });
}
