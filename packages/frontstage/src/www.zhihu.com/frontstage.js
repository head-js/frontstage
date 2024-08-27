import ts2iso from 'vanilla.js/date/ts2iso';
import $ready from '../utils/ready';


$ready(async (Ajv, jsonata, { from, map, lastValueFrom }) => {
  console.log(Ajv);
  console.log(jsonata);
  console.log(from);
  console.log(map);
  console.log(lastValueFrom);

  const backstage = window.backstage;

  backstage.route('GET', '/columns/:columnId/articles', async (ctx, next) => {
    const { columnId } = ctx.params;
    const expectUrl = `https://www.zhihu.com/column/${columnId}`;
    const acturalUrl = `${window.location.origin}${window.location.pathname}`;
    console.assert(acturalUrl === expectUrl);

    const articles = Array.from(document.querySelectorAll('.ContentItem.ArticleItem')).map(($a) => {
      const $title = $a.querySelector('.ContentItem-title a');
      const $published = $a.querySelector('meta[itemprop="datePublished"]');
      const $excerpt = $a.querySelector('.RichContent .RichContent-inner .RichText');

      return {
        title: $title.text,
        url: $title.href,
        created: ts2iso(new Date($published.content)),
        excerpt: $excerpt.textContent.trim(),
      };
    });

    ctx.body = { code: 0, message: 'ok', data: articles };

    next();
  });
}, [ 'ajv', 'jsonata', 'rxjs' ]);
