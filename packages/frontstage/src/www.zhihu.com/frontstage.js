import ts2iso from 'vanilla.js/date/ts2iso';
import $ready from '../utils/ready';


function parseId($a) {
  const $title = $a.querySelector('.ContentItem-title a');

  return {
    title: $title.text,
    url: $title.href,
    $a,
  };

  return articles;
}


function parseContent(item) {
  const { title, url, $a } = item;
  const $published = $a.querySelector('meta[itemprop="datePublished"]');
  const $excerpt = $a.querySelector('.RichContent .RichContent-inner .RichText');

  return {
    title,
    url,
    created: ts2iso(new Date($published.content)),
    excerpt: $excerpt.textContent.trim(),
  };
}


$ready(async (Ajv, jsonata, { from, fromEvent, lastValueFrom, mergeMap, map, share, debounceTime, distinct, tap, ReplaySubject, toArray }) => {
  // console.log(Ajv);
  // console.log(jsonata);

  const backstage = window.backstage;

  backstage.route('GET', '/columns/:columnId/articles-subscriber', async (ctx, next) => {
    const { columnId } = ctx.params;
    const expectUrl = `https://www.zhihu.com/column/${columnId}`;
    const acturalUrl = `${window.location.origin}${window.location.pathname}`;
    console.assert(acturalUrl === expectUrl);

    const scroll$ = fromEvent(window, 'scroll').pipe(
      debounceTime(500),
      mergeMap(() => from(Array.from(document.querySelectorAll('.ContentItem.ArticleItem')))),
      map(($a) => parseId($a)),
      distinct(item => item.url),
      map((item) => parseContent(item)),
      share(),
      tap(item => console.log(item.url)),
    );

    const articles$ = new ReplaySubject();
    scroll$.subscribe(articles$);

    async function complete$() {
      articles$.complete();
      const items = await lastValueFrom(articles$.pipe(toArray()));
      return items;
    }

    ctx.body = { code: 0, message: 'ok', data: {}, complete$ };

    next();
  });
}, [ 'ajv', 'jsonata', 'rxjs' ]);
