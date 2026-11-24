import express from 'express';
import type { ErrorRequestHandler, Request, Response } from 'express';
import type { Actor, Store } from './model.ts';
import {
  ApiError,
  booking,
  equipmentInput,
  fail,
  object,
  staff,
  text,
} from './rules.ts';

interface Options {
  corsOrigins?: string[];
  now?: () => Date;
  timezone?: string;
}
export function createApp(store: Store, options: Options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const origin = req.headers.origin;
    if (origin) {
      res.vary('Origin');
      if (!options.corsOrigins?.includes(origin))
        return next(
          new ApiError(403, 'ORIGIN_DENIED', 'Origin is not allowed.')
        );
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, OPTIONS'
      );
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', mode: store.mode, scope: 'process-only' })
  );
  app.post('/auth/login', async (req, res) => {
    const body = object(req.body);
    text(body.password, 'password', 256);
    const result = await store.signIn(
      text(body.email, 'email', 254),
      body.password as string
    );
    res.json(result);
  });
  app.use(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ') || header.length > 8192)
      fail(401, 'UNAUTHORIZED', 'Bearer token required.');
    res.locals.actor = await store.authenticate(header.slice(7));
    next();
  });
  const actor = (res: Response): Actor => res.locals.actor;
  app.get('/me', (_req, res) => res.json(actor(res).user));
  app.post('/auth/logout', async (_req, res) => {
    await store.signOut(actor(res));
    res.sendStatus(204);
  });
  app.get('/equipment', async (req, res) => {
    const items = await store.equipment(actor(res));
    const filter = (key: string) =>
      typeof req.query[key] === 'string'
        ? String(req.query[key]).trim().toLowerCase()
        : '';
    const q = filter('q'),
      category = filter('category'),
      lab = filter('lab'),
      location = filter('location'),
      status = filter('status');
    res.json(
      items.filter(
        (e) =>
          (!q ||
            [e.id, e.name, e.category, e.lab, e.location].some((v) =>
              v.toLowerCase().includes(q)
            )) &&
          (!category || e.category.toLowerCase() === category) &&
          (!lab || e.lab.toLowerCase() === lab) &&
          (!location || e.location.toLowerCase().includes(location)) &&
          (!status || e.status === status)
      )
    );
  });
  app.get('/equipment/:id', async (req, res) => {
    const item = (await store.equipment(actor(res))).find(
      (e) => e.id === req.params.id
    );
    if (!item) fail(404, 'NOT_FOUND', 'Equipment not found.');
    res.json(item);
  });
  app.post('/equipment', async (req, res) => {
    staff(actor(res).user);
    res
      .status(201)
      .json(
        await store.saveEquipment(actor(res), equipmentInput(req.body), true)
      );
  });
  app.patch('/equipment/:id', async (req, res) => {
    staff(actor(res).user);
    const current = (await store.equipment(actor(res))).find(
      (e) => e.id === req.params.id
    );
    if (!current) fail(404, 'NOT_FOUND', 'Equipment not found.');
    res.json(
      await store.saveEquipment(
        actor(res),
        equipmentInput({ ...current, ...object(req.body) }, current.id),
        false
      )
    );
  });
  app.get('/reservations', async (_req, res) =>
    res.json(await store.reservations(actor(res)))
  );
  app.get('/availability', async (_req, res) =>
    res.json(await store.availability(actor(res)))
  );
  app.post('/reservations', async (req, res) => {
    const input = booking(req.body, options.now?.(), options.timezone);
    res.status(201).json(await store.reserve(actor(res), input));
  });
  for (const action of ['approve', 'reject', 'cancel'] as const) {
    app.post(
      `/reservations/:id/${action}`,
      async (req: Request, res: Response) => {
        const body = object(req.body ?? {});
        const note = text(body.note ?? '', 'note', 200, action === 'reject');
        const details = text(body.details ?? '', 'details', 200, false);
        res.json(
          await store.transition(
            actor(res),
            String(req.params.id),
            action,
            note,
            details
          )
        );
      }
    );
  }
  app.use((_req, _res) => fail(404, 'NOT_FOUND', 'Endpoint not found.'));
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ApiError) {
      res
        .status(error.status)
        .json({ error: { code: error.code, message: error.message } });
      return;
    }
    if (error?.type === 'entity.parse.failed') {
      res
        .status(400)
        .json({ error: { code: 'VALIDATION', message: 'Invalid JSON.' } });
      return;
    }
    if (error?.type === 'entity.too.large') {
      res
        .status(413)
        .json({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request is too large.',
          },
        });
      return;
    }
    console.error(
      'Unhandled API error:',
      error instanceof Error ? error.name : 'unknown'
    );
    res
      .status(500)
      .json({
        error: { code: 'INTERNAL', message: 'Unexpected server error.' },
      });
  };
  app.use(errorHandler);
  return app;
}
