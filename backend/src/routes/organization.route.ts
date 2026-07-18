import { Router } from 'express';
import { createOrganization, getOrganizations, getOrganization } from '../controllers/organization.controller';

const router = Router();

router.post('/', createOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganization);

export default router;
