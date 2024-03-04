from random import shuffle
from http import HTTPStatus

import feedparser
from dateutil import parser
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.news.serializers import NewsSerializer, QueryParams


class NewsViewSet(ViewSet):
    permission_classes = IsAuthenticated,
    SOURCES = [
        'https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss',
    ]

    def get_image_from_entry(self, entry) -> str:
        '''Get image from RSS feed

           This method will check common places where images related in rss
        '''
        # check links
        links = entry.get('links', [])
        for link in links:
            link_type = link.get('type', None)
            if link_type and (link_type == 'image/jpeg' or link_type == 'image/png'):
                return link.get('href', None)

        return None



    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: NewsSerializer},
                         query_serializer=QueryParams)
    @action(detail=False)
    def recent(self, request: Request):
        '''
            View for parsing rss feeds
            Place RSS urls to SOURCES
        '''
        query_params_serializer = QueryParams(data=request.query_params)
        query_params_serializer.is_valid(raise_exception=True)
        feeds = []
        selected_news = []

        # Get news from all sources
        for source in self.SOURCES:
            try:
                feed = feedparser.parse(source)
                news = sorted(feed['entries'], key=lambda item: item['published_parsed'])
                feeds.append(news)
            except Exception as exception:
                return Response((str(exception),), status=HTTPStatus.BAD_GATEWAY)

        #  Check news available
        news_limit = min(query_params_serializer.validated_data['limit'], sum([len(feed) for feed in feeds]))

        # Get data from entries
        while len(selected_news) < news_limit:
            shuffle(feeds)
            for feed in feeds:
                try:
                    item = feed.pop()
                except IndexError:
                    continue
                entry = dict(
                    title=item.get('title'),
                    description=item.get('summary'),
                    url_to_image=self.get_image_from_entry(item),
                    published_at=parser.parse(item['published']) if 'published' in item else None,
                    author=item.get('author', None),
                )
                selected_news.append(entry)

                if len(selected_news) >= news_limit:
                    break

        serializer = NewsSerializer(data=selected_news, many=True)

        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as error:
            raise APIException(detail=error.detail) from error

        return Response(serializer.data)
