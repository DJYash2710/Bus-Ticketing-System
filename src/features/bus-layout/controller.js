import { applyBusLayoutTemplate, getBusLayoutVersion, getCurrentBusLayout, listBusLayoutVersions, regenerateBusLayoutPreview, restoreBusLayoutVersion, saveBusLayout, } from './service.js';
function busIdFromParams(req) {
    return Number(req.params.id ?? req.params.busId);
}
export async function getBusLayoutController(req, res, next) {
    try {
        const result = await getCurrentBusLayout(busIdFromParams(req), req.user);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function saveBusLayoutController(req, res, next) {
    try {
        const result = await saveBusLayout(busIdFromParams(req), req.body, req.user);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function applyBusLayoutTemplateController(req, res, next) {
    try {
        const result = await applyBusLayoutTemplate(busIdFromParams(req), req.body, req.user);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function regenerateBusLayoutController(req, res, next) {
    try {
        const preview = await regenerateBusLayoutPreview(busIdFromParams(req), req.body, req.user);
        res.json({ success: true, data: preview });
    }
    catch (err) {
        next(err);
    }
}
export async function listBusLayoutVersionsController(req, res, next) {
    try {
        const versions = await listBusLayoutVersions(busIdFromParams(req), req.user);
        res.json({ success: true, data: versions });
    }
    catch (err) {
        next(err);
    }
}
export async function getBusLayoutVersionController(req, res, next) {
    try {
        const layout = await getBusLayoutVersion(busIdFromParams(req), Number(req.params.layoutId), req.user);
        res.json({ success: true, data: layout });
    }
    catch (err) {
        next(err);
    }
}
export async function restoreBusLayoutVersionController(req, res, next) {
    try {
        const result = await restoreBusLayoutVersion(busIdFromParams(req), Number(req.params.layoutId), req.user);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map