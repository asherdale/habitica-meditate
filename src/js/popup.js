const INSIGHT_LOGIN_CONFIG = {
  header: 'Step 2: Login to Insight Timer',
  userPlaceholder: 'Email',
  passPlaceholder: 'Password'
};

let HABITICA_LOGIN = true;

$(document).ready(() => main());

main = async () => {
  $('#login-button').click(login);
}

login = () => {
  const loginInput = $('input').map((i, el) => $(el).val()).get();
  return HABITICA_LOGIN ? clientHabiticaLogin(loginInput[0], loginInput[1])
                        : clientInsightLogin(loginInput[0], loginInput[1]);
}

clientHabiticaLogin = async (userId, apiToken) => {
  try {
    const userData = await getHabiticaCustomStart(HABITICA_USER_ID, HABITICA_API_TOKEN);
    await saveData({habiticaUserId: userId, habiticaApiToken: apiToken});
    transferToInsightLogin();
  } catch (e) {
    // TODO: show error for incorrect login info
    dump(`Habitica login error: ${e}`);
  }
}

transferToInsightLogin = () => {
  HABITICA_LOGIN = false;
  $('#login-header').text(INSIGHT_LOGIN_CONFIG.header);
  const resetToPlaceholder = ($el, placeholder) => {
    $el.val('');
    $el.attr('placeholder', placeholder);
  }
  resetToPlaceholder($('#input-user'), INSIGHT_LOGIN_CONFIG.userPlaceholder);
  resetToPlaceholder($('#input-pass'), INSIGHT_LOGIN_CONFIG.passPlaceholder);
}

clientInsightLogin = async (email, password) => {
  const loginResult = await insightLogin(INSIGHT_EMAIL, INSIGHT_PASSWORD);
  dump(loginResult);
  if (loginResult.toLowerCase().includes('sign')) {
    // TODO: show insight error
    return dump('Insight login error');
  }
  dump('Success!');
  await saveData({insightEmail: email, insightPassword: password});
  showContainer('create-container');
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
  dump(`${JSON.stringify(obj)} saved`);
}

readData = async (keys) => {
  return chromep.storage.sync.get(keys);
}

// createDaily = async () => {
//   return $.ajax({
//     url: 'https://habitica.com/api/v3/tasks/user',
//     type: 'POST',
//     data: {'text': `Meditate for ${medLength} minutes`, 'type': 'daily',},
//     beforeSend: (xhr) => {
//       xhr.setRequestHeader('x-api-user', items.userID);
//       xhr.setRequestHeader('x-api-key',  items.apiToken);
//     },
//   });
// }

// scoreDaily = async () => {
//   return $.ajax({
//     url: `https://habitica.com/api/v3/tasks/${items.taskID}/score/up`,
//     type: 'POST',
//     beforeSend: (xhr) => {
//       xhr.setRequestHeader('x-api-user', items.userID);
//       xhr.setRequestHeader('x-api-key',  items.apiToken);
//     },
//   });
// }
