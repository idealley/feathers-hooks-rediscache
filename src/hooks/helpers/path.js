import qs from 'qs';

function parseNestedPath(path, params) {
  let re = new RegExp(':([^\/]+)', 'g');
  let match = null;

  while ((match = re.exec(path)) !== null) {
    if (Object.keys(params).includes(match[1])) {
      path = path.replace(match[0], params[match[1]]);
    }
  }
  return path;
}

function parsePath(hook, config) {
  console.log(hook);
  const q = hook.params.query || {};
  const remove = config.removePathFromCacheKey || false;
  const parseNestedRoutes = config.parseNestedRoutes || false;
  let path = remove && hook.id ? '' : `${hook.path}`;

  if (!remove && parseNestedRoutes) {
    path = parseNestedPath(path, hook.params);
  }

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
