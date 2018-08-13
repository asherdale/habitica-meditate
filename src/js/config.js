const config = {
	INSIGHT_LOGIN_URL: 'https://insighttimer.com/user_session',
	INSIGHT_CSV_URL: 'https://insighttimer.com/sessions/export',
	HABITICA_PREFS_URL: 'https://habitica.com/api/v3/user?userFields=preferences.dayStart',
	HABITICA_CREATE_TASK: 'https://habitica.com/api/v3/tasks/user',
	HABITICA_GET_TASK: (taskId => {
		return `https://habitica.com/api/v3/tasks/${taskId}`;
	}),
	HABITICA_SCORE_TASK: (taskId => {
		return `https://habitica.com/api/v3/tasks/${taskId}/score/up`;
	}),
	HABITICA_TASK_TEXT: (goal => `Meditate for ${goal} minutes`),
	GOAL_REACHED_TEXT: 'Yes :)',
	NUM_REQS_TO_INSIGHT: 7,
	DATE_FORMAT: 'MM-DD-YYYY hh:mm:ss',
	INSIGHT_TEXT: {
  		header: 'Step 2: Login to Insight Timer',
  		userPlaceholder: 'Email',
  		passPlaceholder: 'Password'
	},
	HABITICA_TASK_TYPE: {
		DAILY: 'daily'
	}
}

const KEY_ABSTRACTIONS = {
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