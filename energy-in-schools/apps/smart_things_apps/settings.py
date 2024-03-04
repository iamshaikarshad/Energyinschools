import datetime


REFRESH_TOKEN_URL = 'https://auth-global.api.smartthings.com/oauth/token'
AUTH_TOKEN_LIVE_TIME = datetime.timedelta(minutes=5)
REFRESH_TOKEN_LIVE_TIME = datetime.timedelta(days=30)
REFRESH_TOKEN_CYCLE = datetime.timedelta(days=15)
