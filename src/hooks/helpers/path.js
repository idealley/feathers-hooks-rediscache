import qs from 'querystring';

function parsePath(hook, config) {
  const q = hook.params.query || {};
  const remove = config.removePathFromCacheKey || false;
  let path = remove ? '' : `${hook.path}`;

  console.log('key: ', remove);
  console.log('config: ', config.removePathFromCacheKey);

  if (hook.id) {
    if (path.length !== 0 && !remove) {
      path += '/';
    }
    if (Object.keys(q).length > 0) {
      path += `${hook.id}?${qs.stringify(q)}`;
    } else {
      path += `${hook.id}`;
    }
  } else {
    if (Object.keys(q).length > 0) {
      path += `?${qs.stringify(q)}`;
    }
  }

  return path;
}

export { parsePath };
