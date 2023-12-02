import http from "node:http";
import { routes } from "./routes.js";
import { extractQueryParams } from "./utils/extract-query-params.js";
import { jsonMiddleware } from "./middlewares/json.js";


const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await jsonMiddleware (req, res);

  const route = routes.find((route) => {
    return route.method === method && route.path.test(url)
  });

  if (route) {
    const routeParams = req.url.match(route.path)
    const { query, ...params } = routeParams.groups
    
    req.params = params
    req.query =  query ? extractQueryParams(query) : {}

    return route.handler(req, res)
  }

  return res.writeHead(404).end("route not found")
})

server.listen(3333);
