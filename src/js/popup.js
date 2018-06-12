let SESSION_INFO = {};
let isHabiticaLogin = true;

main = () => {
  $('#login-button').click(login);
  $('#goal-button').click(setGoal);

  attemptAutoLogin();
}

attemptAutoLogin = async () => {
  SESSION_INFO = await getAllStoredData();
  console.log(SESSION_INFO);
  const autoLoginAttempt = await autoLogin(SESSION_INFO.hUser,
                                           SESSION_INFO.hToken);
  if (!autoLoginAttempt) {
    return;
  }
  await autoLogin(SESSION_INFO.iEmail,
                  SESSION_INFO.iPass);
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

habiticaLogin = async (userId, apiToken) => {
  try {
    const userData = await getHabiticaCustomStart(userId, apiToken);
    if (true) { // TODO: change to only save data if different than values in SESSION_INFO
      await saveData({
        hUser: userId,
        hToken: apiToken
      });
    }
    SESSION_INFO.hUser = userId;
    SESSION_INFO.hToken = apiToken;
    transferToInsightLogin();
    return true;
  } catch (e) {
    dump('Habitica login error:');
    dump(e);
  }
}

transferToInsightLogin = () => {
  isHabiticaLogin = false;
  $('#login-header').text(config.INSIGHT_TEXT.header);
  
  const resetToPlaceholder = ($el, placeholder) => {
    $el.val('');
    $el.attr('placeholder', placeholder);
  }

  resetToPlaceholder($('#input-user'), config.INSIGHT_TEXT.userPlaceholder);
  resetToPlaceholder($('#input-pass'), config.INSIGHT_TEXT.passPlaceholder);
}

insightLogin = async (email, password, isAutoLogin) => {
  const loginResult = await postInsightLogin(email, password);
  if (loginResult.toLowerCase().includes('sign')) {
    dump('Insight login error');
    return;
  }

  if (!isAutoLogin) {
    await saveData({iEmail: email, iPass: password});
  }

  SESSION_INFO.iEmail = email;
  SESSION_INFO.iPass = password;

  transferAfterLogin();
}

transferAfterLogin = () => {
  if (SESSION_INFO.dailyId && SESSION_INFO.goalNum) {
    transferToMainPage();
    return;
  }
  showContainer('goal-container');
}

showContainer = (containerId) => {
  $('.container').addClass('display-none');
  $(`#${containerId}`).removeClass('display-none');
}

dump = (input) => {
  $('#dump').prepend(`${JSON.stringify(input)}<br />`);
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
  await saveData({
    dailyId: createdDaily.data.id,
    goalNum: goalNum
  });
  transferToMainPage();
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

transferToMainPage = () => {
  $('#goal-num').text(SESSION_INFO.goalNum);
  $('#progress-num').text(SESSION_INFO.mData);
  $('#sync-date').text(SESSION_INFO.syncDate);
  if (isToday(SESSION_INFO.lastGoal)) {
    $('#goal-reached').text(config.GOAL_REACHED_TEXT);
  }
  showContainer('main-container');
}

$(document).ready(main);