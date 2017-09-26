import qs from 'qs';

function parsePath(hook, config) {
  console.log(hook);
  const q = hook.params.query || {};
  const remove = config.removePathFromCacheKey || false;
  let path = remove && hook.id ? '' : `${hook.path}`;

  if (hook.id) {
    if (path.length !== 0 && !remove) {
      path += '/';
    }
    if (Object.keys(q).length > 0) {
      path += `${hook.id}?${qs.stringify(q, { encode: false })}`;
    } else {
      path += `${hook.id}`;
    }
  } else {
    if (Object.keys(q).length > 0) {
      path += `?${qs.stringify(q, { encode: false })}`;
    }
  }

  return path;
}

export { parsePath };
