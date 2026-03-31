export function validate({ body, params, query } = {}) {
  return (req, _res, next) => {
    try {
      req.validated = {
        body: body ? body(req.body || {}) : req.body || {},
        params: params ? params(req.params || {}) : req.params || {},
        query: query ? query(req.query || {}) : req.query || {},
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
