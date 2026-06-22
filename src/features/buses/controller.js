import { createBus, listBuses, getBusById, updateBus, deleteBus, } from "./service.js";
function getCaller(req) {
    return req.user;
}
export async function createBusController(req, res, next) {
    try {
        const bus = await createBus(req.body, getCaller(req));
        res.status(201).json({ success: true, data: bus });
    }
    catch (err) {
        next(err);
    }
}
export async function listBusesController(req, res, next) {
    try {
        const buses = await listBuses(getCaller(req));
        res.json({ success: true, data: buses });
    }
    catch (err) {
        next(err);
    }
}
export async function getBusByIdController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const bus = await getBusById(id, getCaller(req));
        res.json({ success: true, data: bus });
    }
    catch (err) {
        next(err);
    }
}
export async function updateBusController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const bus = await updateBus(id, req.body, getCaller(req));
        res.json({ success: true, data: bus });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteBusController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const result = await deleteBus(id, getCaller(req));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map