import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware.js';
import { requireRole } from '../../core/middleware/role.middleware.js';
import { validate } from '../../core/middleware/validate.middleware.js';
import {
  applyBusLayoutTemplateController,
  getBusLayoutController,
  getBusLayoutVersionController,
  listBusLayoutVersionsController,
  regenerateBusLayoutController,
  restoreBusLayoutVersionController,
  saveBusLayoutController,
} from './controller.js';
import {
  applyBusLayoutTemplateSchema,
  regenerateBusLayoutSchema,
  saveBusLayoutSchema,
} from './validators.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware, requireRole(['ADMIN', 'OPERATOR']));

router.get('/', getBusLayoutController);
router.get('/versions', listBusLayoutVersionsController);
router.get('/versions/:layoutId', getBusLayoutVersionController);
router.post('/versions/:layoutId/restore', restoreBusLayoutVersionController);
router.put('/', validate(saveBusLayoutSchema), saveBusLayoutController);
router.post(
  '/apply-template',
  validate(applyBusLayoutTemplateSchema),
  applyBusLayoutTemplateController,
);
router.post(
  '/regenerate',
  validate(regenerateBusLayoutSchema),
  regenerateBusLayoutController,
);

export const busLayoutRouter = router;
