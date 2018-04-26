const HABITICA_LOGIN = true;

$(document).ready(() => {
  $('.login-button').click(login);
});

login = () => {
  const loginInput = $('input').map((i, el) => $(el).val()).get();
  return HABITICA_LOGIN ? habiticaLogin(loginInput) : insightLogin(loginInput);
}

habiticaLogin = (input) => {
  dump(input);
}

insightLogin = (input) => {
  
}

dump = (input) => {
  $('#dump').append(`${String(input)}\n`);
}


// function saveData(obj, callback) {
//   chrome.storage.sync.set(obj, () => {
//     callback();
//   });
// }

// function readData(keys, callback) {
//   chrome.storage.sync.get(keys, (items) => {
//     callback(items);
//   });
// }

// function createDaily() {
//   readData(['userID', 'apiToken'], (items) => {
//     let response = '';
//     let medLength = $('#meditation-num').val();

//     $.ajax({
//       url: 'https://habitica.com/api/v3/tasks/user',
//       type: 'POST',
//       data: {'text': `Meditate for ${medLength} minutes`, 'type': 'daily',},
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
//         saveData({'taskID': response.data.id,}, () => {
//           scoreDaily();
//         });
//       },
//     });
//   });
// }

// function scoreDaily() {
//   let response = ""
//   // readData(['userID', 'apiToken', 'taskID'], (items) => {
//   //   if (items.taskID && items.userID && items.apiToken) {
//   //     $.ajax({
//   //       url: `https://habitica.com/api/v3/tasks/${items.taskID}/score/up`,
//   //       type: 'POST',
//   //       async: true,
//   //       beforeSend: (xhr) => {
//   //         xhr.setRequestHeader('x-api-user', items.userID);
//   //         xhr.setRequestHeader('x-api-key',  items.apiToken);
//   //       },
//   //       success: (res) => {
//   //         response = res;
//   //       },
//   //       complete: () => {
//   //         console.log(response);
//   //       },
//   //     });
//   //   }
//   // });
// }
