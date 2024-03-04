from unittest.mock import MagicMock, patch

from dateutil import parser

from apps.accounts.permissions import RoleName
from apps.main.base_test_case import BaseTestCase


# noinspection PyArgumentList
FEED = {  # minimal values
    'entries': [{
        'published': f'Wed, {index + 1} Jun 2018 14:12:17 GMT',
        'links': [
            {'href': 'http://www.nasa.gov/centers/armstrong/multimedia/imagegallery/Ikhana/AFRC2018-0217-12.html',
                'rel': 'alternate',
                'type': 'text/html'},
            {'href': 'http://www.nasa.gov/sites/default/files/thumbnails/image/afrc2018-0127-12.jpg',
                'length': '1216348',
                'rel': 'enclosure',
                'type': 'image/jpeg'}
        ],
        'published_parsed': index,  # there should be time.struct_time but it doesn't mater
        'summary': f'Text {index}',
        'title': f'Title {index}',
        'author': 'NASA'
    } for index in range(25)],
    'feed': {'title': 'NASA', },
}


class TestNews(BaseTestCase):
    URL = '/api/v1/news/recent/'
    FORCE_LOGIN_AS = RoleName.ES_USER

    @patch('feedparser.parse', return_value=FEED)
    def test_recent(self, mock: MagicMock):
        response = self.client.get(self.get_url())

        self.assertResponse(response)

        mock.assert_called_with(
            'https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss'
        )

        self.assertEqual(25, len(response.data))

        for index, item in enumerate(reversed(FEED['entries'])):
            self.assertDictEqual(
                dict(
                    title=item['title'],
                    description=item['summary'],
                    url_to_image=item['links'][1]['href'] if item['links'] else None,
                    published_at=self.format_datetime(parser.parse(item['published'])),
                    author=FEED['feed']['title'],
                ),
                dict(response.data[index])
            )

    @patch('feedparser.parse', return_value=FEED)
    def test_recent_with_limit(self, _):
        response = self.client.get(self.get_url(query_param=dict(limit=3)))

        self.assertResponse(response)
        self.assertEqual(3, len(response.data))
