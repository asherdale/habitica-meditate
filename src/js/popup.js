$(document).ready(() => {
  $('#hab-submit').click(habiticaLogin);
  $('#insight-submit').click(insightLogin);
  $('#create-daily').click(createDaily);

  readData(['userID', 'apiToken', 'insightUser', 'insightPass'], (items) => {
    if (items.userID && items.apiToken && items.insightUser && items.insightPass) {
      $('#main').css('display', 'block');
    } else {
      $('#hab-login').css('display', 'block');
    }
  });
});


function saveData(obj, callback) {
  chrome.storage.sync.set(obj, () => {
    callback();
  });
}

function readData(keys, callback) {
  chrome.storage.sync.get(keys, (items) => {
    callback(items);
  });
}

function habiticaLogin() {
  const habUser = $('#hab-user').val();
  const habPass = $('#hab-pass').val();

  const values = {
    'username': habUser,
    'password': habPass,
  };

  let response = '';

  $.ajax({
    url: 'https://habitica.com/api/v3/user/auth/local/login',
    type: 'POST',
    data: values,
    async: true,
    dataType: 'json',
    success: (res) => {
      response = res;
    },
    complete: () => {
      if (response.success) {
        $('#hab-login').css('display', 'none');
        $('#insight-login').css('display', 'block');
        saveData({'userID': response.data.id, 'apiToken': response.data.apiToken, }, () => {});
      }
    },
  });
}

function insightLogin() {
  const insightUser = $('#insight-user').val();
  const insightPass = $('#insight-pass').val();

  const values = {
    'username': insightUser,
    'password': insightPass,
  };

  $.ajax({
    url: 'https://insighttimer.com/user_session',
    type: 'POST',
    data: values,
    async: true,
    dataType: 'html',
    complete: (xhr) => {
      if (xhr.status === 200) {
        // success
        $('#insight-login').css('display', 'none');
        $('#main').css('display', 'block');
        saveData({insightUser, insightPass,}, () => {});
      }
    },
  });
}

function createDaily() {
  readData(['userID', 'apiToken'], (items) => {
    let response = '';
    let medLength = $('#meditation-num').val();

    $.ajax({
      url: 'https://habitica.com/api/v3/tasks/user',
      type: 'POST',
      data: {'text': `Meditate for ${medLength} minutes`, 'type': 'daily',},
      async: true,
      beforeSend: (xhr) => {
        xhr.setRequestHeader('x-api-user', items.userID);
        xhr.setRequestHeader('x-api-key',  items.apiToken);
      },
      success: (res) => {
        response = res;
      },
      complete: () => {
        console.log(response);
        saveData({'taskID': response.data.id,}, () => {
          scoreDaily();
        });
      },
    });
  });
}

function scoreDaily() {
  let response = ""
  // readData(['userID', 'apiToken', 'taskID'], (items) => {
  //   if (items.taskID && items.userID && items.apiToken) {
  //     $.ajax({
  //       url: `https://habitica.com/api/v3/tasks/${items.taskID}/score/up`,
  //       type: 'POST',
  //       async: true,
  //       beforeSend: (xhr) => {
  //         xhr.setRequestHeader('x-api-user', items.userID);
  //         xhr.setRequestHeader('x-api-key',  items.apiToken);
  //       },
  //       success: (res) => {
  //         response = res;
  //       },
  //       complete: () => {
  //         console.log(response);
  //       },
  //     });
  //   }
  // });
}
