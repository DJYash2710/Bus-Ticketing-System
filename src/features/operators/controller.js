import { createOperator, getOperatorById, listOperators, updateOperator, } from "./service.js";
export async function createOperatorController(req, res, next) {
    try {
        const result = await createOperator(req.body);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function listOperatorsController(_req, res, next) {
    try {
        const operators = await listOperators();
        res.json({ success: true, data: operators });
    }
    catch (err) {
        next(err);
    }
}
export async function getOperatorByIdController(req, res, next) {
    try {
        const operator = await getOperatorById(Number(req.params.id));
        res.json({ success: true, data: operator });
    }
    catch (err) {
        next(err);
    }
}
export async function updateOperatorController(req, res, next) {
    try {
        const operator = await updateOperator(Number(req.params.id), req.body);
        res.json({ success: true, data: operator });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map