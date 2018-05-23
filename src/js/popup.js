const SAVE_KEYS = {
  hUser: 'habiticaUserId',
  hToken: 'habiticaApiToken',
  iEmail: 'insightEmail',
  iPass: 'insightPassword',
  dailyId: 'meditationDailyId'
};

const INSIGHT_LOGIN_CONFIG = {
  header: 'Step 2: Login to Insight Timer',
  userPlaceholder: 'Email',
  passPlaceholder: 'Password'
};

const SESSION_INFO = {};

let isHabiticaLogin = true;

main = () => {
  $('#login-button').click(login);
  $('#goal-button').click(setGoal);

  attemptAutoLogin();
}

attemptAutoLogin = async () => {
  const loginStorage = await readData(Object.values(SAVE_KEYS));
  const autoLoginAttempt = await autoLogin(loginStorage[SAVE_KEYS.hUser],
                                           loginStorage[SAVE_KEYS.hToken]);
  if (!autoLoginAttempt) {
    return;
  }
  await autoLogin(loginStorage[SAVE_KEYS.iEmail],
                  loginStorage[SAVE_KEYS.iPass]);
}

autoLogin = async (savedUser, savedPass) => {
  if (!savedUser || !savedPass) {
    return;
  }
  $('#input-user').val(savedUser);
  $('#input-pass').val(savedPass);
  return login();
}

login = async () => {
  const loginInput = $('input').map((i, el) => $(el).val()).get();
  return isHabiticaLogin ? habiticaLogin(loginInput[0], loginInput[1])
                         : insightLogin(loginInput[0], loginInput[1]);
}

habiticaLogin = async (userId, apiToken, isAutoLogin) => {
  try {
    const userData = await getHabiticaCustomStart(userId, apiToken);
    if (!isAutoLogin) {
      await saveData(
        {
          [SAVE_KEYS.hUser]: userId,
          [SAVE_KEYS.hToken]: apiToken
        }
      );
    }
    SESSION_INFO.hUser = userId;
    SESSION_INFO.hToken = apiToken;
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

insightLogin = async (email, password, isAutoLogin) => {
  const loginResult = await postInsightLogin(email, password);
  if (loginResult.toLowerCase().includes('sign')) {
    dump('Insight login error');
    return;
  }

  if (!isAutoLogin) {
    await saveData({[SAVE_KEYS.iEmail]: email, [SAVE_KEYS.iPass]: password});
  }

  SESSION_INFO.iEmail = email;
  SESSION_INFO.iPass = password;

  showContainer('goal-container');
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

setGoal = async () => {
  const goalInput = $('#goal-input').val();
  const goalNum = parseInt(goalInput);

  if (goalNum < 1) {
    throw new Error('Invalid goal input');
  }

  const createdDaily = await createDaily(
    SESSION_INFO.hUser,
    SESSION_INFO.hToken,
    goalNum
  );

  const dailyId = createdDaily.data.id;

  SESSION_INFO.dailyId = dailyId;
  SESSION_INFO.goalNum = goalNum;
  await saveData({[SAVE_KEYS.dailyId]: createdDaily.data.id});
  setUpMainContainer();
  showContainer('main-container');
}

createDaily = async (userId, apiToken, goal) => {
  return $.ajax({
    url: 'https://habitica.com/api/v3/tasks/user',
    type: 'POST',
    data: {'text': `Meditate for ${goal} minutes`, 'type': 'daily',},
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

setUpMainContainer = () => {
  $('#goal-num').text(SESSION_INFO.goalNum);
}

$(document).ready(main);