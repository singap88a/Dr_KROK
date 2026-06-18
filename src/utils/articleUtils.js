export function getArticleSlug(blog) {
  if (blog?.slug) return blog.slug;
  return String(blog?.id ?? '');
}

export function getArticlePath(blog) {
  return `/articles/${encodeURIComponent(getArticleSlug(blog))}`;
}

export function blogMatchesParam(blog, param) {
  if (!blog || !param) return false;
  let decoded = param;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    decoded = param;
  }
  if (blog.slug && blog.slug === decoded) return true;
  return String(blog.id) === decoded || String(blog.id) === param;
}

export function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || div.innerText || '';
}
